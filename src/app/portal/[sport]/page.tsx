import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sportFromParam, TRANSFER_STATUSES } from "@/lib/enums";
import { formatDate, formatHeight, formatMoney } from "@/lib/format";
import { one, type SearchParams } from "@/lib/params";
import { CollegeChip, FilterBar, PageTitle, Stars, StatusPill } from "@/components/ui";

export const metadata = { title: "Transfer Portal" };

export default async function PortalPage({ params, searchParams }: { params: Promise<{ sport: string }>; searchParams: SearchParams }) {
  const { sport: sportParam } = await params;
  const sport = sportFromParam(sportParam);
  if (!sport) notFound();
  const status = one((await searchParams).status);

  const entries = await db.transferEntry.findMany({
    where: { athlete: { sport }, ...(status && { status }) },
    include: { fromCollege: true, toCollege: true, athlete: { include: { ratings: true } } },
  });
  const portalScore = (e: (typeof entries)[number]) => e.athlete.ratings.find((r) => r.kind === "TRANSFER")?.score ?? 0;
  entries.sort((a, b) => portalScore(b) - portalScore(a));

  const counts = await db.transferEntry.groupBy({ by: ["status"], where: { athlete: { sport } }, _count: true });
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageTitle title={`${sport === "FOOTBALL" ? "Football" : "Basketball"} Transfer Portal`} subtitle="Players in the portal, ranked by FAA transfer rating." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["In portal", countOf("ENTERED")], ["Committed", countOf("COMMITTED") + countOf("EXPECTED")], ["Enrolled", countOf("ENROLLED")], ["Withdrawn", countOf("WITHDRAWN")]].map(([label, n]) => (
          <div key={label} className="rounded bg-ink p-3 text-white">
            <div className="text-xs font-bold uppercase text-zinc-400">{label}</div>
            <div className="display text-2xl">{n}</div>
          </div>
        ))}
      </div>
      <FilterBar
        action={`/portal/${sportParam.toLowerCase()}`}
        selects={[{ name: "status", value: status, options: [{ value: "", label: "All statuses" }, ...TRANSFER_STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))] }]}
      />
      <div className="overflow-x-auto">
        <table className="table-faa">
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Portal / HS rating</th>
              <th>Status</th>
              <th>Last school</th>
              <th>New school</th>
              <th>NIL</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const tr = e.athlete.ratings.find((r) => r.kind === "TRANSFER");
              const hs = e.athlete.ratings.find((r) => r.kind === "HS");
              return (
                <tr key={e.id}>
                  <td>
                    <Link href={`/athletes/${e.athlete.slug}`} className="font-bold hover:text-brand">
                      {e.athlete.firstName} {e.athlete.lastName}
                    </Link>
                    <div className="text-xs text-zinc-500">Entered {formatDate(e.enteredAt)}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="font-semibold">{e.athlete.position}</span> · {e.eligibility}
                    <div className="text-xs text-zinc-500">
                      {formatHeight(e.athlete.heightIn)} / {e.athlete.weightLb}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {tr && (
                      <div>
                        TP <Stars count={tr.stars} /> <span className="font-bold">{tr.score.toFixed(2)}</span>
                      </div>
                    )}
                    {hs && (
                      <div>
                        HS <Stars count={hs.stars} /> {hs.score.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusPill status={e.status} />
                  </td>
                  <td>
                    <CollegeChip college={e.fromCollege} />
                  </td>
                  <td>{e.toCollege ? <CollegeChip college={e.toCollege} /> : <span className="text-zinc-400">?</span>}</td>
                  <td className="font-semibold">{formatMoney(e.athlete.nilValuation)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
