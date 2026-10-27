import Link from "next/link";
import type { Article, User } from "@prisma/client";
import { ARTICLE_CATEGORIES } from "@/lib/enums";
import { formatDate } from "@/lib/format";

export function ArticleCard({ article }: { article: Article & { author: User } }) {
  return (
    <article className="border-b py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-brand">
        {ARTICLE_CATEGORIES[article.category] ?? article.category}
        {article.premium && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-white">Premium</span>}
      </div>
      <Link href={`/news/${article.slug}`} className="mt-1 block text-lg font-bold leading-snug hover:text-brand">
        {article.title}
      </Link>
      <div className="mt-1 text-xs text-zinc-500">
        {article.author.displayName} · {formatDate(article.publishedAt)}
      </div>
    </article>
  );
}
