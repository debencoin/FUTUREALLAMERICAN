import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { teamClassRankings } from "@/lib/rankings";
import { CollegeChip, RankBadge, SectionTitle, Stars } from "@/components/ui";
import { ArticleCard } from "@/components/ArticleCard";

export default async function Home() {
  const [topPlayers, teams, articles, commits] = await Promise.all([
    db.rating.findMany({
      where: { source: "FAA", kind: "HS", athlete: { sport: "FOOTBALL", classYear: 2027 } },
      include: { athlete: { include: { committedCollege: true } } },
      orderBy: { nationalRank: "asc" },
      take: 10,
    }),
    teamClassRankings("FOOTBALL", 2027).then((rows) => rows.slice(0, 10)),
    db.article.findMany({ include: { author: true }, orderBy: { publishedAt: "desc" }, take: 6 }),
    db.commitEvent.findMany({
      include: { college: true, athlete: { include: { ratings: { where: { source: "FAA", kind: "HS" } } } } },
      orderBy: { occurredAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center gap-6 rounded bg-ink px-6 py-10 text-center text-white md:flex-row md:text-left">
        <Image src="/brand/logo.jpeg" alt="Future All American" width={180} height={180} className="rounded-full" priority />
        <div>
          <h1 className="display text-4xl md:text-5xl">
            Find the next <span className="text-brand">All American</span>
          </h1>
          <p className="mt-3 max-w-xl text-zinc-300">Rankings, commitments, expert predictions, the transfer portal and NIL for every top high school and college prospect.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/rankings/players/football/2027" className="rounded bg-brand px-5 py-2 font-bold uppercase hover:bg-brand-dark">
              2027 Rankings
            </Link>
            <Link href="/database" className="rounded border border-white px-5 py-2 font-bold uppercase hover:bg-white hover:text-ink">
              Search Database
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionTitle title="Latest news" href="/news" />
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </section>
        <section>
          <SectionTitle title="Latest commits" href="/commits" />
          <ul className="divide-y text-sm">
            {commits.map((c) => (
              <li key={c.id} className="py-2">
                <Link href={`/athletes/${c.athlete.slug}`} className="font-bold hover:text-brand">
                  {c.athlete.firstName} {c.athlete.lastName}
                </Link>{" "}
                <span className="text-xs text-zinc-500">
                  {c.athlete.position} · {c.athlete.ratings[0] && <Stars count={c.athlete.ratings[0].stars} />}
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <CollegeChip college={c.college} />
                  <span className="text-xs text-zinc-500">{formatDate(c.occurredAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <SectionTitle title="2027 Top 10 players" href="/rankings/players/football/2027" />
          <ol className="divide-y">
            {topPlayers.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                <RankBadge rank={r.nationalRank ?? 0} />
                <div className="flex-1">
                  <Link href={`/athletes/${r.athlete.slug}`} className="font-bold hover:text-brand">
                    {r.athlete.firstName} {r.athlete.lastName}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {r.athlete.position} · {r.athlete.hometownCity}, {r.athlete.hometownState}
                  </div>
                </div>
                <div className="text-right">
                  <Stars count={r.stars} />
                  <div className="font-bold">{r.score.toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <SectionTitle title="2027 Team rankings" href="/rankings/teams/football/2027" />
          <ol className="divide-y">
            {teams.map((t) => (
              <li key={t.college.id} className="flex items-center gap-3 py-2 text-sm">
                <RankBadge rank={t.rank} />
                <div className="flex-1">
                  <CollegeChip college={t.college} />
                </div>
                <span className="text-xs text-zinc-500">{t.total} commits</span>
                <span className="w-16 text-right font-bold">{t.score.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
