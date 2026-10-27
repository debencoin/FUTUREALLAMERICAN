import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageTitle } from "@/components/ui";

export default async function ThreadPage({ params }: { params: Promise<{ slug: string; threadId: string }> }) {
  const { slug, threadId } = await params;
  const thread = await db.thread.findUnique({
    where: { id: threadId },
    include: { board: true, posts: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!thread || thread.board.slug !== slug || thread.board.premium) notFound();

  return (
    <>
      <Link href={`/boards/${slug}`} className="text-sm font-semibold text-brand hover:underline">
        {thread.board.name}
      </Link>
      <PageTitle title={thread.title} />
      <ol className="space-y-3">
        {thread.posts.map((p) => (
          <li key={p.id} className="rounded border p-4">
            <div className="mb-2 text-xs text-zinc-500">
              <span className="font-bold text-ink">{p.author.displayName}</span> · {formatDate(p.createdAt)}
            </div>
            <p>{p.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-zinc-500">Posting replies arrives with member accounts.</p>
    </>
  );
}
