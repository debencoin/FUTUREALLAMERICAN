// Imports athletes from a CSV or Excel file and recomputes FAA ranks for every class touched.
// Usage: npm run import:athletes -- path/to/athletes.csv (or .xlsx)
// Column names are flexible; see ALIASES in src/lib/importAthletes.ts and scripts/examples/athletes.csv.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { importAthletes, parseCsv, parseXlsx, toRecords } from "../src/lib/importAthletes";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Pass a file path: npm run import:athletes -- athletes.csv");
  const bytes = readFileSync(file);
  const rows = file.toLowerCase().endsWith(".xlsx")
    ? await parseXlsx(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
    : parseCsv(bytes.toString("utf8"));
  const { records, unknownColumns } = toRecords(rows);
  if (unknownColumns.length) console.warn(`Ignored columns: ${unknownColumns.join(", ")}`);

  const db = new PrismaClient();
  const result = await importAthletes(db, records);
  for (const s of result.skipped) console.warn(`Row ${s.row}: skipped, ${s.reason}`);
  for (const w of result.warnings) console.warn(`Row ${w.row}: ${w.message}`);
  console.log(`Created ${result.created}, updated ${result.updated}, skipped ${result.skipped.length} of ${result.total} rows; re-ranked ${result.reranked.join(", ") || "nothing"}.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
