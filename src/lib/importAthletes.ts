import type { PrismaClient } from "@prisma/client";
import { recomputeRanks, starsForScore } from "./rankings";
import { ATHLETE_STATUSES, SPORTS } from "./enums";

export type ImportRow = Record<string, string>;

export type ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: { row: number; reason: string }[];
  warnings: { row: number; message: string }[];
  reranked: string[];
};

// Spreadsheet headers people commonly use for each field, compared after lowercasing and dropping
// spaces, underscores and punctuation. The canonical name comes first.
const ALIASES: Record<string, string[]> = {
  firstName: ["firstname", "first", "fname", "givenname"],
  lastName: ["lastname", "last", "lname", "surname", "familyname"],
  name: ["name", "fullname", "player", "athlete", "playername", "athletename"],
  sport: ["sport"],
  classYear: ["classyear", "class", "year", "gradyear", "graduationyear", "grad"],
  position: ["position", "pos"],
  heightIn: ["heightin", "height", "ht", "heightinches"],
  weightLb: ["weightlb", "weight", "wt", "weightlbs"],
  highSchool: ["highschool", "school", "hs"],
  city: ["city", "hometown", "hometowncity", "town"],
  state: ["state", "st", "hometownstate"],
  score: ["score", "rating", "faarating", "grade"],
  stars: ["stars", "star", "starrating"],
  status: ["status", "commitstatus"],
  committedTo: ["committedto", "commit", "committed", "college", "commitment"],
  nilValuation: ["nilvaluation", "nil", "nilvalue"],
  slug: ["slug", "id", "athleteid"],
};

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function mapHeaders(headers: string[]): { mapping: Record<string, string>; unknown: string[] } {
  const mapping: Record<string, string> = {};
  const unknown: string[] = [];
  for (const header of headers) {
    const key = normalizeHeader(header);
    const field = Object.entries(ALIASES).find(([, aliases]) => aliases.includes(key))?.[0];
    if (field && !Object.values(mapping).includes(field)) mapping[header] = field;
    else if (header.trim()) unknown.push(header);
  }
  return { mapping, unknown };
}

export function parseCsv(text: string): string[][] {
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
  return rows.filter((r) => r.some((c) => c.trim()));
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= sheet.columnCount; c++) {
      const cell = row.getCell(c);
      cells.push(cell.text ?? "");
    }
    rows.push(cells);
  });
  return rows.filter((r) => r.some((c) => c.trim()));
}

// Turns a parsed sheet (first row = headers) into records keyed by canonical field names.
export function toRecords(rows: string[][]): { records: ImportRow[]; unknownColumns: string[] } {
  const [header = [], ...body] = rows;
  const { mapping, unknown } = mapHeaders(header);
  const records = body.map((cells) => {
    const rec: ImportRow = {};
    header.forEach((h, i) => {
      const field = mapping[h];
      if (field) rec[field] = (cells[i] ?? "").trim();
    });
    return rec;
  });
  return { records, unknownColumns: unknown };
}

// "6-2", "6'2\"", "6 2" or plain inches all become inches.
export function parseHeight(value: string): number | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const feetInches = v.match(/^(\d)\s*['\-\s]\s*(\d{1,2}(?:\.\d+)?)/);
  if (feetInches) return Math.round(Number(feetInches[1]) * 12 + Number(feetInches[2]));
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

// "$1.2M", "650K", "450,000" all become whole dollars.
export function parseMoney(value: string): number | undefined {
  const v = value.trim().replace(/[$,\s]/g, "").toUpperCase();
  if (!v) return undefined;
  const m = v.match(/^(\d+(?:\.\d+)?)([KM]?)$/);
  if (!m) return undefined;
  const mult = m[2] === "M" ? 1_000_000 : m[2] === "K" ? 1_000 : 1;
  return Math.round(Number(m[1]) * mult);
}

// Stars without a score map to the bottom of that star band so ranking still works.
const SCORE_FOR_STARS: Record<number, number> = { 5: 98, 4: 89, 3: 80, 2: 70 };

export async function importAthletes(db: PrismaClient, records: ImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { total: records.length, created: 0, updated: 0, skipped: [], warnings: [], reranked: [] };
  const classes = new Set<string>();
  const colleges = await db.college.findMany();
  const findCollege = (name: string) => {
    const key = slugify(name);
    return colleges.find((c) => c.slug === key || slugify(c.shortName) === key || slugify(c.name) === key);
  };

  for (const [i, rec] of records.entries()) {
    const rowNum = i + 2; // spreadsheet row, counting the header
    if (rec.name && (!rec.firstName || !rec.lastName)) {
      const parts = rec.name.trim().split(/\s+/);
      rec.firstName ||= parts[0] ?? "";
      rec.lastName ||= parts.slice(1).join(" ");
    }
    const missing = ["firstName", "lastName", "sport", "classYear", "position"].filter((k) => !rec[k]);
    if (missing.length) {
      result.skipped.push({ row: rowNum, reason: `missing ${missing.join(", ")}` });
      continue;
    }

    const sport = rec.sport.toUpperCase().replace(/^FB$/, "FOOTBALL").replace(/^(BB|MBB|HOOPS)$/, "BASKETBALL");
    if (!(SPORTS as readonly string[]).includes(sport)) {
      result.skipped.push({ row: rowNum, reason: `unknown sport "${rec.sport}"` });
      continue;
    }
    const classYear = parseInt(rec.classYear, 10);
    if (!Number.isFinite(classYear) || classYear < 2000 || classYear > 2100) {
      result.skipped.push({ row: rowNum, reason: `class year "${rec.classYear}" is not a year` });
      continue;
    }

    let score = rec.score ? Number(rec.score) : undefined;
    if (score !== undefined && (!Number.isFinite(score) || score < 0 || score > 100)) {
      result.warnings.push({ row: rowNum, message: `rating "${rec.score}" ignored, must be 0-100` });
      score = undefined;
    }
    if (score === undefined && rec.stars) score = SCORE_FOR_STARS[parseInt(rec.stars, 10)];
    if (score === undefined) result.warnings.push({ row: rowNum, message: "no rating or stars, so this athlete won't appear in rankings or search yet" });

    const college = rec.committedTo ? findCollege(rec.committedTo) : undefined;
    if (rec.committedTo && !college) result.warnings.push({ row: rowNum, message: `college "${rec.committedTo}" not found, left uncommitted` });

    let status = "UNCOMMITTED";
    if (college) {
      const given = rec.status?.toUpperCase();
      status = given && (ATHLETE_STATUSES as readonly string[]).includes(given) && given !== "UNCOMMITTED" ? given : "COMMITTED";
    }

    const highSchool =
      rec.highSchool && rec.city && rec.state
        ? await db.highSchool.upsert({
            where: { name_city_state: { name: rec.highSchool, city: rec.city, state: rec.state.toUpperCase() } },
            update: {},
            create: { name: rec.highSchool, city: rec.city, state: rec.state.toUpperCase() },
          })
        : null;

    const slug = rec.slug || slugify(`${rec.firstName} ${rec.lastName} ${classYear}`);
    const data = {
      firstName: rec.firstName,
      lastName: rec.lastName,
      sport,
      classYear,
      position: rec.position.toUpperCase(),
      heightIn: rec.heightIn ? parseHeight(rec.heightIn) : undefined,
      weightLb: rec.weightLb ? parseInt(rec.weightLb, 10) || undefined : undefined,
      hometownCity: rec.city || undefined,
      hometownState: rec.state ? rec.state.toUpperCase() : undefined,
      highSchoolId: highSchool?.id,
      nilValuation: rec.nilValuation ? parseMoney(rec.nilValuation) : undefined,
      committedCollegeId: college?.id ?? null,
      status,
    };

    const existing = await db.athlete.findUnique({ where: { slug }, select: { id: true } });
    const athlete = existing
      ? await db.athlete.update({ where: { slug }, data })
      : await db.athlete.create({ data: { slug, ...data, commitDate: college ? new Date() : null } });
    if (existing) result.updated++;
    else result.created++;

    if (score !== undefined) {
      await db.rating.upsert({
        where: { athleteId_source_kind: { athleteId: athlete.id, source: "FAA", kind: "HS" } },
        update: { score, stars: starsForScore(score), ratedAt: new Date() },
        create: { athleteId: athlete.id, source: "FAA", kind: "HS", score, stars: starsForScore(score) },
      });
    }
    classes.add(`${sport}:${classYear}`);
  }

  for (const key of classes) {
    const [sport, year] = key.split(":");
    await recomputeRanks(db, sport, Number(year));
    result.reranked.push(`${year} ${sport.toLowerCase()}`);
  }
  return result;
}
