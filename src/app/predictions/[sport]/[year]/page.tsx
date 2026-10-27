import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sportFromParam } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { CLASS_YEARS, PAGE_SIZE, hrefWith, one, pageNumber, type SearchParams } from "@/lib/params";
import { CollegeChip, FilterBar, PageTitle, Pager, SectionTitle, Stars } from "@/components/ui";

export const metadata = { title: "Prediction Machine" };

function accuracy(correct: number, resolved: number) {
  return resolved ? `${((correct / resolved) * 100).toFixed(1)}%` : "-";
}

export default async function PredictionsPage({ params, searchParams }: { params: Promise<{ sport: string; year: string }>; searchParams: SearchParams }) {
  const { sport: sportParam, year } = await params;
  const sport = sportFromParam(sportParam);
  const classYear = parseInt(year, 10);
  if (!sport || !Number.isFinite(classYear)) notFound();
  const sp = await searchParams;
  const result = one(sp.result);
  const page = pageNumber(sp.page);

  const where = { athlete: { sport, classYear }, ...(result && { result }) };
  const [predictions, total, experts] = await Promise.all([
    db.prediction.findMany({
      where,
      include: { college: true, expert: true, athlete: { include: { ratings: { where: { source: "FAA", kind: "HS" } } } } },
      orderBy: { predictedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.prediction.count({ where }),
    db.expert.findMany({ include: { predictions: { select: { result: true } } } }),
  ]);

  const leaderboard = experts
    .map((e) => {
      const correct = e.predictions.filter((p) => p.result === "CORRECT").length;
      const resolved = e.predictions.filter((p) => p.result !== "PENDING").length;
      return { expert: e, correct, resolved, total: e.predictions.length, pct: resolved ? correct / resolved : 0 };
    })
    .sort((a, b) => b.pct - a.pct);

  const base = `/predictions/${sportParam.toLowerCase()}/${classYear}`;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <PageTitle title="Recruiting Prediction Machine" subtitle={`${total} ${classYear} expert predictions`} />
        <FilterBar
          action={base}
          selects={[{ name: "result", value: result, options: [{ value: "", label: "All results" }, { value: "PENDING", label: "Pending" }, { value: "CORRECT", label: "Correct" }, { value: "INCORRECT", label: "Incorrect" }] }]}
        />
        <div className="mb-3 flex gap-2 text-sm">
          {CLASS_YEARS.map((y) => (
            <a key={y} href={`/predictions/${sportParam.toLowerCase()}/${y}`} className={`rounded px-3 py-1 font-semibold ${y === classYear ? "bg-brand text-white" : "bg-panel"}`}>
              {y}
            </a>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="table-faa">
            <thead>
              <tr>
                <th>Player</th>
                <th>Predicted by</th>
                <th>Prediction</th>
                <th className="text-right">Confidence</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => {
                const r = p.athlete.ratings[0];
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/athletes/${p.athlete.slug}`} className="font-bold hover:text-brand">
                        {p.athlete.firstName} {p.athlete.lastName}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        {p.athlete.position} · {r && <Stars count={r.stars} />} {r?.score.toFixed(2)} · Natl {r?.nationalRank}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold">{p.expert.displayName}</div>
                      <div className="text-xs text-zinc-500">
                        {p.expert.outlet} · {formatDate(p.predictedAt)}
                      </div>
                    </td>
                    <td>
                      <CollegeChip college={p.college} />
                    </td>
                    <td className="text-right font-bold">{p.confidence}%</td>
                    <td className={`font-bold uppercase ${p.result === "CORRECT" ? "text-green-700" : p.result === "INCORRECT" ? "text-zinc-400" : "text-zinc-600"}`}>{p.result.toLowerCase()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} pageCount={Math.ceil(total / PAGE_SIZE)} makeHref={(p) => hrefWith(base, { result, page: p })} />
      </div>
      <aside>
        <SectionTitle title="Expert leaderboard" />
        <table className="table-faa">
          <thead>
            <tr>
              <th>Expert</th>
              <th className="text-right">Correct</th>
              <th className="text-right">Acc</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.expert.id}>
                <td>
                  <div className="font-semibold">{row.expert.displayName}</div>
                  <div className="text-xs text-zinc-500">{row.expert.outlet}</div>
                </td>
                <td className="text-right">
                  {row.correct}/{row.resolved}
                </td>
                <td className="text-right font-bold">{accuracy(row.correct, row.resolved)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
    </div>
  );
}
