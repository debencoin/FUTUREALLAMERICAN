import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate, formatHeight, formatMoney, titleCase } from "@/lib/format";
import { CollegeChip, SectionTitle, Stars, StatusPill } from "@/components/ui";

async function getAthlete(slug: string) {
  return db.athlete.findUnique({
    where: { slug },
    include: {
      highSchool: true,
      committedCollege: true,
      ratings: { orderBy: { kind: "asc" } },
      offers: { include: { college: true }, orderBy: { offeredAt: "desc" } },
      visits: { include: { college: true }, orderBy: { visitDate: "desc" } },
      events: { include: { college: true }, orderBy: { occurredAt: "desc" } },
      predictions: { include: { college: true, expert: true }, orderBy: { predictedAt: "desc" } },
      transfers: { include: { fromCollege: true, toCollege: true } },
      articleTags: { include: { article: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const athlete = await getAthlete((await params).slug);
  return { title: athlete ? `${athlete.firstName} ${athlete.lastName}` : "Athlete" };
}

export default async function AthletePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getAthlete((await params).slug);
  if (!a) notFound();

  const hs = a.ratings.find((r) => r.kind === "HS");
  const transfer = a.ratings.find((r) => r.kind === "TRANSFER");

  // Crystal-ball style summary: share of expert picks per school.
  const pickCounts = new Map<string, { college: (typeof a.predictions)[number]["college"]; count: number }>();
  for (const p of a.predictions) {
    const entry = pickCounts.get(p.collegeId) ?? { college: p.college, count: 0 };
    entry.count++;
    pickCounts.set(p.collegeId, entry);
  }
  const picks = [...pickCounts.values()].sort((x, y) => y.count - x.count);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded bg-ink p-6 text-white md:flex-row md:items-center">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-brand bg-zinc-800 text-4xl font-black">
          {a.firstName[0]}
          {a.lastName[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="display text-3xl">
              {a.firstName} {a.lastName}
            </h1>
            {a.verified ? (
              <span className="rounded bg-brand px-2 py-0.5 text-xs font-bold uppercase">Verified</span>
            ) : (
              <Link href={`/athletes/${a.slug}/claim`} className="rounded border border-brand px-2 py-0.5 text-xs font-bold uppercase text-brand hover:bg-brand hover:text-white">
                Claim this profile
              </Link>
            )}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <Bio label="Pos" value={a.position} />
            <Bio label="Class" value={String(a.classYear)} />
            <Bio label="Ht / Wt" value={`${formatHeight(a.heightIn)} / ${a.weightLb ?? "-"}`} />
            <Bio label="Sport" value={titleCase(a.sport)} />
            <Bio label="High school" value={a.highSchool?.name ?? "-"} />
            <Bio label="Hometown" value={a.hometownCity ? `${a.hometownCity}, ${a.hometownState}` : "-"} />
            <Bio label="NIL valuation" value={formatMoney(a.nilValuation)} />
            <Bio label="Status" value={titleCase(a.status)} />
          </dl>
        </div>
        <div className="rounded bg-white p-4 text-ink">
          {hs ? (
            <>
              <div className="text-xs font-bold uppercase text-zinc-500">FAA Rating</div>
              <div className="display text-4xl">{hs.score.toFixed(2)}</div>
              <Stars count={hs.stars} />
              <div className="mt-2 grid grid-cols-3 gap-3 text-center text-xs">
                <Rank label="Natl" value={hs.nationalRank} />
                <Rank label={a.position} value={hs.positionRank} />
                <Rank label={a.hometownState ?? "St"} value={hs.stateRank} />
              </div>
            </>
          ) : (
            <div className="text-sm">Not yet rated</div>
          )}
          {transfer && (
            <div className="mt-3 border-t pt-2 text-xs">
              Portal rating <span className="font-bold">{transfer.score.toFixed(2)}</span> <Stars count={transfer.stars} />
            </div>
          )}
        </div>
      </section>

      {a.committedCollege && (
        <div className="flex items-center gap-3 rounded border-l-8 bg-panel p-4" style={{ borderColor: a.committedCollege.primaryColor }}>
          <StatusPill status={a.status} />
          <CollegeChip college={a.committedCollege} />
          {a.commitDate && <span className="text-sm text-zinc-600">since {formatDate(a.commitDate)}</span>}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <SectionTitle title={`Offers (${a.offers.length})`} />
          <ul className="divide-y text-sm">
            {a.offers.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <CollegeChip college={o.college} />
                <span className="text-zinc-500">{formatDate(o.offeredAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-8">
          <div>
            <SectionTitle title="Expert predictions" href="/predictions/football/2027" linkLabel="Prediction machine" />
            {picks.length === 0 ? (
              <p className="text-sm text-zinc-500">No predictions yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {picks.map((p) => (
                  <li key={p.college.id} className="flex items-center gap-3">
                    <div className="w-48">
                      <CollegeChip college={p.college} />
                    </div>
                    <div className="h-3 flex-1 rounded bg-zinc-200">
                      <div className="h-3 rounded bg-brand" style={{ width: `${(p.count / a.predictions.length) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-bold">{Math.round((p.count / a.predictions.length) * 100)}%</span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-3 divide-y text-xs text-zinc-600">
              {a.predictions.map((p) => (
                <li key={p.id} className="py-1.5">
                  <span className="font-semibold text-ink">{p.expert.displayName}</span> picked {p.college.name} ({p.confidence}%) on {formatDate(p.predictedAt)}
                  {p.result !== "PENDING" && <span className={p.result === "CORRECT" ? "ml-1 font-bold text-green-700" : "ml-1 font-bold text-zinc-400"}>{p.result.toLowerCase()}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionTitle title="Visits" />
            {a.visits.length === 0 ? (
              <p className="text-sm text-zinc-500">No visits logged.</p>
            ) : (
              <ul className="divide-y text-sm">
                {a.visits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between py-2">
                    <CollegeChip college={v.college} />
                    <span className="text-zinc-500">
                      {titleCase(v.type)} · {formatDate(v.visitDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {a.transfers.length > 0 && (
            <div>
              <SectionTitle title="Transfer portal" />
              {a.transfers.map((t) => (
                <p key={t.id} className="text-sm">
                  Entered {formatDate(t.enteredAt)} from {t.fromCollege.name} as a {t.eligibility}. Status: <StatusPill status={t.status} />
                  {t.toCollege && <> to {t.toCollege.name}</>}
                </p>
              ))}
            </div>
          )}

          <div>
            <SectionTitle title="Timeline" />
            <ul className="space-y-1 text-sm">
              {a.events.map((e) => (
                <li key={e.id}>
                  <span className="font-semibold">{formatDate(e.occurredAt)}</span> · {titleCase(e.type)} to {e.college.name}
                </li>
              ))}
              {a.offers.length > 0 && (
                <li>
                  <span className="font-semibold">{formatDate(a.offers[a.offers.length - 1].offeredAt)}</span> · First offer from {a.offers[a.offers.length - 1].college.name}
                </li>
              )}
            </ul>
          </div>

          {a.articleTags.length > 0 && (
            <div>
              <SectionTitle title="News" />
              <ul className="space-y-1 text-sm">
                {a.articleTags.map(({ article }) => (
                  <li key={article.id}>
                    <Link href={`/news/${article.slug}`} className="font-semibold hover:text-brand">
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Bio({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-zinc-400">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Rank({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="font-bold uppercase text-zinc-500">{label}</div>
      <div className="text-lg font-black">{value ?? "-"}</div>
    </div>
  );
}
