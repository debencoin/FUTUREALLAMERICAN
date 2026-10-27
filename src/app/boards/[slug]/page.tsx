import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageTitle } from "@/components/ui";

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const board = await db.board.findUnique({
    where: { slug: (await params).slug },
    include: { threads: { include: { author: true, _count: { select: { posts: true } } }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] } },
  });
  if (!board) notFound();

  if (board.premium) {
    return (
      <>
        <PageTitle title={board.name} subtitle={board.description ?? undefined} />
        <div className="rounded bg-ink p-6 text-center text-white">
          <p className="display text-xl">Members only</p>
          <Link href="/join" className="mt-4 inline-block rounded bg-brand px-5 py-2 font-bold uppercase">
            Join to read
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={board.name} subtitle={board.description ?? undefined} />
      <ul className="divide-y">
        {board.threads.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3">
            <div>
              {t.pinned && <span className="mr-2 rounded bg-brand px-1.5 text-[10px] font-bold uppercase text-white">Pinned</span>}
              <Link href={`/boards/${board.slug}/${t.id}`} className="font-bold hover:text-brand">
                {t.title}
              </Link>
              <div className="text-xs text-zinc-500">
                {t.author.displayName} · {formatDate(t.createdAt)}
              </div>
            </div>
            <span className="text-sm text-zinc-500">{t._count.posts} replies</span>
          </li>
        ))}
      </ul>
    </>
  );
}
