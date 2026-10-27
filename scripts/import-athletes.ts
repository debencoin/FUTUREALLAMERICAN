// Imports athletes from a CSV file and recomputes FAA ranks for every class touched.
// Usage: npm run import:athletes -- path/to/athletes.csv
// Columns (header row required, order free): see scripts/examples/athletes.csv
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { recomputeRanks, starsForScore } from "../src/lib/rankings";

const REQUIRED = ["firstName", "lastName", "sport", "classYear", "position"];

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  const endField = () => {
    row.push(field);
    field = "";
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") endField();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      endField();
      rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) {
    endField();
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const num = (s: string | undefined) => (s ? Number(s) : undefined);

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Pass a CSV path: npm run import:athletes -- athletes.csv");
  const records = parseCsv(readFileSync(file, "utf8"));
  const db = new PrismaClient();
  const classes = new Set<string>();
  let imported = 0;

  for (const [i, rec] of records.entries()) {
    const missing = REQUIRED.filter((k) => !rec[k]);
    if (missing.length) {
      console.warn(`Row ${i + 2}: skipped, missing ${missing.join(", ")}`);
      continue;
    }
    const sport = rec.sport.toUpperCase();
    const classYear = Number(rec.classYear);
    const slug = rec.slug || slugify(`${rec.firstName} ${rec.lastName} ${classYear}`);

    const highSchool = rec.highSchool && rec.city && rec.state
      ? await db.highSchool.upsert({
          where: { name_city_state: { name: rec.highSchool, city: rec.city, state: rec.state } },
          update: {},
          create: { name: rec.highSchool, city: rec.city, state: rec.state },
        })
      : null;
    const college = rec.committedTo ? await db.college.findFirst({ where: { OR: [{ name: rec.committedTo }, { slug: slugify(rec.committedTo) }] } }) : null;
    if (rec.committedTo && !college) console.warn(`Row ${i + 2}: college "${rec.committedTo}" not found, left uncommitted`);

    const data = {
      firstName: rec.firstName,
      lastName: rec.lastName,
      sport,
      classYear,
      position: rec.position.toUpperCase(),
      heightIn: num(rec.heightIn),
      weightLb: num(rec.weightLb),
      hometownCity: rec.city || undefined,
      hometownState: rec.state || undefined,
      highSchoolId: highSchool?.id,
      nilValuation: num(rec.nilValuation),
      committedCollegeId: college?.id ?? null,
      status: college ? (rec.status?.toUpperCase() || "COMMITTED") : "UNCOMMITTED",
    };
    const athlete = await db.athlete.upsert({ where: { slug }, update: data, create: { slug, ...data } });

    if (rec.score) {
      const score = Number(rec.score);
      await db.rating.upsert({
        where: { athleteId_source_kind: { athleteId: athlete.id, source: "FAA", kind: "HS" } },
        update: { score, stars: starsForScore(score), ratedAt: new Date() },
        create: { athleteId: athlete.id, source: "FAA", kind: "HS", score, stars: starsForScore(score) },
      });
    }
    classes.add(`${sport}:${classYear}`);
    imported++;
  }

  for (const key of classes) {
    const [sport, year] = key.split(":");
    await recomputeRanks(db, sport, Number(year));
  }
  console.log(`Imported ${imported} of ${records.length} rows; re-ranked ${classes.size} class(es).`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
