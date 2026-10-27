import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, titleCase } from "@/lib/format";
import { teamClassRankings } from "@/lib/rankings";
import { one, type SearchParams } from "@/lib/params";
import { Stars } from "@/components/ui";

const TABS = ["commits", "offers", "visits"] as const;

export default async function CollegePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: SearchParams }) {
  const college = await db.college.findUnique({ where: { slug: (await params).slug } });
  if (!college) notFound();
  const tab = (TABS as readonly string[]).includes(one((await searchParams).tab)) ? one((await searchParams).tab) : "commits";
  const classYear = 2027;
  const hsRating = { where: { source: "FAA", kind: "HS" } };

  const [ranking, commits, offers, visits] = await Promise.all([
    teamClassRankings("FOOTBALL", classYear).then((rows) => rows.find((r) => r.college.id === college.id)),
    db.athlete.findMany({ where: { committedCollegeId: college.id, classYear: { gte: classYear } }, include: { ratings: hsRating } }),
    tab === "offers" ? db.offer.findMany({ where: { collegeId: college.id, athlete: { classYear } }, include: { athlete: { include: { ratings: hsRating } } } }) : [],
    tab === "visits" ? db.visit.findMany({ where: { collegeId: college.id }, include: { athlete: { include: { ratings: hsRating } } }, orderBy: { visitDate: "desc" } }) : [],
  ]);
  const byScore = <T extends { ratings: { score: number }[] }>(a: T, b: T) => (b.ratings[0]?.score ?? 0) - (a.ratings[0]?.score ?? 0);
  commits.sort(byScore);

  return (
    <>
      <section className="mb-6 flex flex-wrap items-center gap-6 rounded p-6 text-white" style={{ backgroundColor: college.primaryColor }}>
        <div className="display text-4xl">{college.name}</div>
        <div className="text-sm opacity-90">{college.conference}</div>
        {ranking && (
          <div className="ml-auto rounded bg-black/40 px-4 py-2 text-center">
            <div className="text-xs font-bold uppercase">{classYear} class rank</div>
            <div className="display text-3xl">#{ranking.rank}</div>
            <div className="text-xs">
              {ranking.total} commits · score {ranking.score.toFixed(2)}
            </div>
          </div>
        )}
      </section>
      <nav className="mb-4 flex gap-2 text-sm">
        {TABS.map((t) => (
          <Link key={t} href={`/colleges/${college.slug}?tab=${t}`} className={`rounded px-3 py-1 font-semibold capitalize ${t === tab ? "bg-brand text-white" : "bg-panel"}`}>
            {t}
          </Link>
        ))}
      </nav>
      <table className="table-faa">
        <thead>
          <tr>
            <th>Player</th>
            <th>Class</th>
            <th>Pos</th>
            <th>Rating</th>
            <th>{tab === "commits" ? "Status" : tab === "offers" ? "Offered" : "Visit"}</th>
          </tr>
        </thead>
        <tbody>
          {tab === "commits" &&
            commits.map((a) => <Row key={a.id} athlete={a} extra={titleCase(a.status)} />)}
          {tab === "offers" &&
            offers.sort((x, y) => byScore(x.athlete, y.athlete)).map((o) => <Row key={o.id} athlete={o.athlete} extra={formatDate(o.offeredAt)} />)}
          {tab === "visits" && visits.map((v) => <Row key={v.id} athlete={v.athlete} extra={`${titleCase(v.type)} · ${formatDate(v.visitDate)}`} />)}
        </tbody>
      </table>
    </>
  );
}

function Row({ athlete, extra }: { athlete: { slug: string; firstName: string; lastName: string; classYear: number; position: string; ratings: { stars: number; score: number }[] }; extra: string }) {
  const r = athlete.ratings[0];
  return (
    <tr>
      <td>
        <Link href={`/athletes/${athlete.slug}`} className="font-bold hover:text-brand">
          {athlete.firstName} {athlete.lastName}
        </Link>
      </td>
      <td>{athlete.classYear}</td>
      <td className="font-semibold">{athlete.position}</td>
      <td className="whitespace-nowrap">{r && <><Stars count={r.stars} /> {r.score.toFixed(2)}</>}</td>
      <td>{extra}</td>
    </tr>
  );
}
