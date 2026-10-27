const TEMPLATE = [
  "First Name,Last Name,Sport,Class,Position,Height,Weight,High School,City,State,Rating,Status,Committed To,NIL",
  "Example,Prospect,Football,2027,QB,6-3,205,Sample Central,Austin,TX,97.4,Committed,Texas,450000",
  "Demo,Guard,Basketball,2028,PG,6-2,175,Sample Prep,Atlanta,GA,93.1,,,",
].join("\n");

export function GET() {
  return new Response(TEMPLATE + "\n", {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="faa-athletes-template.csv"' },
  });
}
