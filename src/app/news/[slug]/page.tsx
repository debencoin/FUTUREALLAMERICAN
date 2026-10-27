import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ARTICLE_CATEGORIES } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { CollegeChip } from "@/components/ui";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await db.article.findUnique({
    where: { slug: (await params).slug },
    include: { author: true, athletes: { include: { athlete: true } }, colleges: { include: { college: true } } },
  });
  if (!article) notFound();

  // Premium stories show the first paragraph to everyone until accounts and billing ship.
  const paragraphs = article.body.split("\n\n");
  const visible = article.premium ? paragraphs.slice(0, 1) : paragraphs;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-wide text-brand">{ARTICLE_CATEGORIES[article.category]}</div>
      <h1 className="mt-2 text-3xl font-black leading-tight">{article.title}</h1>
      <div className="mt-2 text-sm text-zinc-500">
        By {article.author.displayName} · {formatDate(article.publishedAt)}
      </div>
      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        {visible.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {article.premium && (
        <div className="mt-6 rounded bg-ink p-6 text-center text-white">
          <div className="display text-xl">
            This story is for <span className="text-brand">members</span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">Get every premium story, insider forum and expert intel.</p>
          <Link href="/join" className="mt-4 inline-block rounded bg-brand px-5 py-2 font-bold uppercase hover:bg-brand-dark">
            Join now
          </Link>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3 border-t pt-4 text-sm">
        {article.athletes.map(({ athlete }) => (
          <Link key={athlete.id} href={`/athletes/${athlete.slug}`} className="rounded bg-panel px-3 py-1 font-semibold hover:bg-zinc-200">
            {athlete.firstName} {athlete.lastName}
          </Link>
        ))}
        {article.colleges.map(({ college }) => (
          <CollegeChip key={college.id} college={college} />
        ))}
      </div>
    </article>
  );
}
