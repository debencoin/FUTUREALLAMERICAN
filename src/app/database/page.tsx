import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FOOTBALL_POSITIONS, BASKETBALL_POSITIONS } from "@/lib/enums";
import { PAGE_SIZE, hrefWith, one, pageNumber, type SearchParams } from "@/lib/params";
import { FilterBar, PageTitle, Pager } from "@/components/ui";
import { PlayerTable } from "@/components/PlayerTable";

export const metadata = { title: "Recruit Database" };

export default async function DatabasePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const sport = one(sp.sport);
  const classYear = one(sp.class);
  const position = one(sp.position);
  const page = pageNumber(sp.page);

  const words = q.split(/\s+/).filter(Boolean);
  const where: Prisma.RatingWhereInput = {
    source: "FAA",
    kind: "HS",
    athlete: {
      ...(sport && { sport }),
      ...(classYear && { classYear: parseInt(classYear, 10) }),
      ...(position && { position }),
      AND: words.map((w) => ({ OR: [{ firstName: { contains: w } }, { lastName: { contains: w } }, { highSchool: { name: { contains: w } } }] })),
    },
  };

  const [rows, total] = await Promise.all([
    db.rating.findMany({
      where,
      include: { athlete: { include: { highSchool: true, committedCollege: true } } },
      orderBy: [{ score: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.rating.count({ where }),
  ]);

  return (
    <>
      <PageTitle title="Recruit Database" subtitle={`${total} athletes match. Ranks shown are within each athlete's own class.`} />
      <FilterBar
        action="/database"
        query={q}
        selects={[
          { name: "sport", value: sport, options: [{ value: "", label: "All sports" }, { value: "FOOTBALL", label: "Football" }, { value: "BASKETBALL", label: "Basketball" }] },
          { name: "class", value: classYear, options: [{ value: "", label: "All classes" }, ...[2023, 2024, 2025, 2027, 2028].map((y) => ({ value: String(y), label: String(y) }))] },
          { name: "position", value: position, options: [{ value: "", label: "All positions" }, ...[...FOOTBALL_POSITIONS, ...BASKETBALL_POSITIONS].map((p) => ({ value: p, label: p }))] },
        ]}
      />
      <PlayerTable rows={rows} />
      <Pager page={page} pageCount={Math.ceil(total / PAGE_SIZE)} makeHref={(p) => hrefWith("/database", { q, sport, class: classYear, position, page: p })} />
    </>
  );
}
