import Link from "next/link";
import type { Athlete, College, HighSchool, Rating } from "@prisma/client";
import { CollegeChip, RankBadge, Stars, StatusPill } from "./ui";
import { formatHeight, formatMoney } from "@/lib/format";

export type PlayerRow = Rating & { athlete: Athlete & { highSchool: HighSchool | null; committedCollege: College | null } };

export function PlayerTable({ rows }: { rows: PlayerRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-faa">
        <thead>
          <tr>
            <th>Rk</th>
            <th>Player</th>
            <th>Pos</th>
            <th>Ht / Wt</th>
            <th>Rating</th>
            <th className="text-center">Natl / Pos / St</th>
            <th>Status</th>
            <th>NIL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const a = r.athlete;
            return (
              <tr key={r.id}>
                <td>
                  <RankBadge rank={r.nationalRank ?? 0} />
                </td>
                <td>
                  <Link href={`/athletes/${a.slug}`} className="font-bold hover:text-brand">
                    {a.firstName} {a.lastName}
                  </Link>
                  {a.verified ? (
                    <span className="ml-2 rounded bg-ink px-1.5 text-[10px] font-bold uppercase text-white">Verified</span>
                  ) : (
                    <Link href={`/athletes/${a.slug}/claim`} className="ml-2 text-[10px] font-bold uppercase text-brand hover:underline">
                      Claim
                    </Link>
                  )}
                  <div className="text-xs text-zinc-500">
                    {a.highSchool ? `${a.highSchool.name} (${a.hometownCity}, ${a.hometownState})` : "-"}
                  </div>
                </td>
                <td className="font-semibold">{a.position}</td>
                <td className="whitespace-nowrap">
                  {formatHeight(a.heightIn)} / {a.weightLb ?? "-"}
                </td>
                <td className="whitespace-nowrap">
                  <Stars count={r.stars} /> <span className="font-bold">{r.score.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap text-center">
                  {r.nationalRank ?? "-"} / {r.positionRank ?? "-"} / {r.stateRank ?? "-"}
                </td>
                <td>{a.committedCollege ? <CollegeChip college={a.committedCollege} /> : <StatusPill status={a.status} />}</td>
                <td className="whitespace-nowrap font-semibold">{formatMoney(a.nilValuation)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
