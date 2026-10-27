import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { positionsFor, sportFromParam } from "@/lib/enums";
import { CLASS_YEARS, PAGE_SIZE, hrefWith, one, pageNumber, type SearchParams } from "@/lib/params";
import { FilterBar, PageTitle, Pager } from "@/components/ui";
import { PlayerTable } from "@/components/PlayerTable";

export default async function PlayerRankingsPage({ params, searchParams }: { params: Promise<{ sport: string; year: string }>; searchParams: SearchParams }) {
  const { sport: sportParam, year } = await params;
  const sport = sportFromParam(sportParam);
  const classYear = parseInt(year, 10);
  if (!sport || !Number.isFinite(classYear)) notFound();

  const sp = await searchParams;
  const position = one(sp.position);
  const state = one(sp.state);
  const status = one(sp.status);
  const page = pageNumber(sp.page);

  const where: Prisma.RatingWhereInput = {
    source: "FAA",
    kind: "HS",
    athlete: {
      sport,
      classYear,
      ...(position && { position }),
      ...(state && { hometownState: state }),
      ...(status === "COMMITTED" ? { status: { in: ["COMMITTED", "SIGNED", "ENROLLED"] } } : status ? { status } : {}),
    },
  };

  const [rows, total, states] = await Promise.all([
    db.rating.findMany({
      where,
      include: { athlete: { include: { highSchool: true, committedCollege: true } } },
      orderBy: { nationalRank: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.rating.count({ where }),
    db.athlete.findMany({ where: { sport, classYear }, select: { hometownState: true }, distinct: ["hometownState"], orderBy: { hometownState: "asc" } }),
  ]);

  const base = `/rankings/players/${sportParam.toLowerCase()}/${classYear}`;
  return (
    <>
      <PageTitle title={`${classYear} ${sport === "FOOTBALL" ? "Football" : "Basketball"} Player Rankings`} subtitle={`FAA Rating · ${total} prospects`} />
      <FilterBar
        action={base}
        selects={[
          { name: "position", value: position, options: [{ value: "", label: "All positions" }, ...positionsFor(sport).map((p) => ({ value: p, label: p }))] },
          { name: "state", value: state, options: [{ value: "", label: "All states" }, ...states.filter((s) => s.hometownState).map((s) => ({ value: s.hometownState!, label: s.hometownState! }))] },
          {
            name: "status",
            value: status,
            options: [
              { value: "", label: "All statuses" },
              { value: "COMMITTED", label: "Committed" },
              { value: "UNCOMMITTED", label: "Uncommitted" },
              { value: "SIGNED", label: "Signed" },
              { value: "ENROLLED", label: "Enrolled" },
            ],
          },
        ]}
      />
      <div className="mb-3 flex gap-2 text-sm">
        {CLASS_YEARS.map((y) => (
          <a key={y} href={`/rankings/players/${sportParam.toLowerCase()}/${y}`} className={`rounded px-3 py-1 font-semibold ${y === classYear ? "bg-brand text-white" : "bg-panel"}`}>
            {y}
          </a>
        ))}
        <span className="mx-2 border-l" />
        {(["football", "basketball"] as const).map((s) => (
          <a key={s} href={`/rankings/players/${s}/${classYear}`} className={`rounded px-3 py-1 font-semibold capitalize ${s.toUpperCase() === sport ? "bg-ink text-white" : "bg-panel"}`}>
            {s}
          </a>
        ))}
      </div>
      <PlayerTable rows={rows} />
      <Pager page={page} pageCount={Math.ceil(total / PAGE_SIZE)} makeHref={(p) => hrefWith(base, { position, state, status, page: p })} />
    </>
  );
}
