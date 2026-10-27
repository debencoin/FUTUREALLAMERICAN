import { notFound } from "next/navigation";
import { CONFERENCES, sportFromParam } from "@/lib/enums";
import { teamClassRankings } from "@/lib/rankings";
import { CLASS_YEARS, one, type SearchParams } from "@/lib/params";
import { CollegeChip, FilterBar, PageTitle, RankBadge } from "@/components/ui";

export default async function TeamRankingsPage({ params, searchParams }: { params: Promise<{ sport: string; year: string }>; searchParams: SearchParams }) {
  const { sport: sportParam, year } = await params;
  const sport = sportFromParam(sportParam);
  const classYear = parseInt(year, 10);
  if (!sport || !Number.isFinite(classYear)) notFound();
  const conference = one((await searchParams).conference);

  const rows = await teamClassRankings(sport, classYear, conference || undefined);
  const base = `/rankings/teams/${sportParam.toLowerCase()}/${classYear}`;

  return (
    <>
      <PageTitle
        title={`${classYear} ${sport === "FOOTBALL" ? "Football" : "Basketball"} Team Recruiting Rankings`}
        subtitle="Team score weights each commit by its place in the class: the best counts fully, each next one 10% less."
      />
      <FilterBar
        action={base}
        selects={[{ name: "conference", value: conference, options: [{ value: "", label: "All conferences" }, ...CONFERENCES.map((c) => ({ value: c, label: c }))] }]}
      />
      <div className="mb-3 flex gap-2 text-sm">
        {CLASS_YEARS.map((y) => (
          <a key={y} href={`/rankings/teams/${sportParam.toLowerCase()}/${y}`} className={`rounded px-3 py-1 font-semibold ${y === classYear ? "bg-brand text-white" : "bg-panel"}`}>
            {y}
          </a>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="table-faa">
          <thead>
            <tr>
              <th>Rk</th>
              <th>Team</th>
              <th>Conf</th>
              <th className="text-center">5★</th>
              <th className="text-center">4★</th>
              <th className="text-center">3★</th>
              <th className="text-center">Total</th>
              <th className="text-right">Avg</th>
              <th className="text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.college.id}>
                <td>
                  <RankBadge rank={r.rank} />
                </td>
                <td>
                  <CollegeChip college={r.college} />
                </td>
                <td>{r.college.conference}</td>
                <td className="text-center">{r.fiveStars}</td>
                <td className="text-center">{r.fourStars}</td>
                <td className="text-center">{r.threeStars}</td>
                <td className="text-center font-semibold">{r.total}</td>
                <td className="text-right">{r.avgRating.toFixed(2)}</td>
                <td className="text-right font-bold">{r.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
