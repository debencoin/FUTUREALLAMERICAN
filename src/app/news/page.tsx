import { db } from "@/lib/db";
import { ARTICLE_CATEGORIES } from "@/lib/enums";
import { one, type SearchParams } from "@/lib/params";
import { FilterBar, PageTitle } from "@/components/ui";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata = { title: "News" };

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const category = one((await searchParams).category);
  const articles = await db.article.findMany({
    where: category ? { category } : undefined,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <>
      <PageTitle title="Recruiting News" />
      <FilterBar action="/news" selects={[{ name: "category", value: category, options: [{ value: "", label: "All categories" }, ...Object.entries(ARTICLE_CATEGORIES).map(([value, label]) => ({ value, label }))] }]} />
      <div className="max-w-3xl">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {articles.length === 0 && <p className="text-sm text-zinc-500">No stories in this category yet.</p>}
      </div>
    </>
  );
}
