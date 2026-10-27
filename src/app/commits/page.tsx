import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, titleCase } from "@/lib/format";
import { one, type SearchParams } from "@/lib/params";
import { CollegeChip, FilterBar, PageTitle, Stars } from "@/components/ui";

export const metadata = { title: "Commitments" };

export default async function CommitsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const sport = one(sp.sport) || "FOOTBALL";
  const type = one(sp.type);

  const events = await db.commitEvent.findMany({
    where: { athlete: { sport }, ...(type && { type }) },
    include: { college: true, athlete: { include: { ratings: { where: { source: "FAA", kind: "HS" } } } } },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageTitle title="Latest Commitments" subtitle="Commits, decommits, signings and enrollments, newest first." />
      <FilterBar
        action="/commits"
        selects={[
          { name: "sport", value: sport, options: [{ value: "FOOTBALL", label: "Football" }, { value: "BASKETBALL", label: "Basketball" }] },
          { name: "type", value: type, options: [{ value: "", label: "All moves" }, { value: "COMMIT", label: "Commits" }, { value: "DECOMMIT", label: "Decommits" }, { value: "SIGN", label: "Signings" }, { value: "ENROLL", label: "Enrollments" }] },
        ]}
      />
      <table className="table-faa">
        <thead>
          <tr>
            <th>Date</th>
            <th>Player</th>
            <th>Rating</th>
            <th>Move</th>
            <th>School</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const r = e.athlete.ratings[0];
            return (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{formatDate(e.occurredAt)}</td>
                <td>
                  <Link href={`/athletes/${e.athlete.slug}`} className="font-bold hover:text-brand">
                    {e.athlete.firstName} {e.athlete.lastName}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {e.athlete.classYear} {e.athlete.position}
                  </div>
                </td>
                <td className="whitespace-nowrap">{r && <><Stars count={r.stars} /> {r.score.toFixed(2)}</>}</td>
                <td className="font-semibold">{titleCase(e.type)}</td>
                <td>
                  <CollegeChip college={e.college} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
