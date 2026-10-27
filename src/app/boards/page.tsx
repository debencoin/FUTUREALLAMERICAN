import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Forums" };

export default async function BoardsPage() {
  const boards = await db.board.findMany({
    include: {
      college: true,
      threads: { include: { _count: { select: { posts: true } }, posts: { orderBy: { createdAt: "desc" }, take: 1, include: { author: true } } }, orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ collegeId: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageTitle title="Forums" subtitle="Talk recruiting with fans of every program." />
      <table className="table-faa">
        <thead>
          <tr>
            <th>Board</th>
            <th className="text-right">Threads</th>
            <th className="text-right">Messages</th>
            <th>Latest</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((b) => {
            const latest = b.threads[0];
            const messages = b.threads.reduce((n, t) => n + t._count.posts, 0);
            return (
              <tr key={b.id}>
                <td>
                  <Link href={`/boards/${b.slug}`} className="font-bold hover:text-brand">
                    {b.name}
                  </Link>
                  {b.premium && <span className="ml-2 rounded bg-brand px-1.5 text-[10px] font-bold uppercase text-white">Premium</span>}
                  {b.description && <div className="text-xs text-zinc-500">{b.description}</div>}
                </td>
                <td className="text-right">{b.threads.length}</td>
                <td className="text-right">{messages}</td>
                <td className="text-xs">
                  {latest ? (
                    <>
                      <div className="font-semibold">{latest.title}</div>
                      <div className="text-zinc-500">
                        {latest.posts[0]?.author.displayName} · {formatDate(latest.posts[0]?.createdAt ?? latest.createdAt)}
                      </div>
                    </>
                  ) : (
                    "None"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
