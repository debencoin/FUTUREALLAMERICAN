import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, titleCase } from "@/lib/format";
import { one, type SearchParams } from "@/lib/params";
import { CollegeChip, FilterBar, PageTitle, RankBadge } from "@/components/ui";

export const metadata = { title: "NIL 100" };

export default async function NilPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const level = one(sp.level);
  const sport = one(sp.sport);

  const athletes = await db.athlete.findMany({
    where: {
      nilValuation: { not: null },
      ...(sport && { sport }),
      // High school athletes have a class year in the future; college athletes have a past one.
      ...(level === "HS" && { classYear: { gte: 2027 } }),
      ...(level === "COLLEGE" && { classYear: { lt: 2027 } }),
    },
    include: { highSchool: true, committedCollege: true },
    orderBy: { nilValuation: "desc" },
    take: 100,
  });

  return (
    <>
      <PageTitle title="NIL 100" subtitle="Estimated annual name, image and likeness value. FAA estimates from rating, position and profile." />
      <FilterBar
        action="/nil"
        selects={[
          { name: "level", value: level, options: [{ value: "", label: "All levels" }, { value: "HS", label: "High school" }, { value: "COLLEGE", label: "College" }] },
          { name: "sport", value: sport, options: [{ value: "", label: "All sports" }, { value: "FOOTBALL", label: "Football" }, { value: "BASKETBALL", label: "Basketball" }] },
        ]}
      />
      <table className="table-faa">
        <thead>
          <tr>
            <th>Rk</th>
            <th>Player</th>
            <th>Pos</th>
            <th>Team</th>
            <th className="text-right">NIL valuation</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((a, i) => (
            <tr key={a.id}>
              <td>
                <RankBadge rank={i + 1} />
              </td>
              <td>
                <Link href={`/athletes/${a.slug}`} className="font-bold hover:text-brand">
                  {a.firstName} {a.lastName}
                </Link>
                <div className="text-xs text-zinc-500">
                  {titleCase(a.sport)} · {a.highSchool ? `${a.highSchool.name} (${a.hometownCity}, ${a.hometownState})` : `Class of ${a.classYear}`}
                </div>
              </td>
              <td className="font-semibold">{a.position}</td>
              <td>{a.committedCollege ? <CollegeChip college={a.committedCollege} /> : "-"}</td>
              <td className="display text-right text-lg">{formatMoney(a.nilValuation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
