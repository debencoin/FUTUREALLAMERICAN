import type { PrismaClient } from "@prisma/client";
import { db } from "./db";

// Each next commit in a class counts 10% less than the one before it,
// so a class is judged on quality first and size second.
export const TEAM_SCORE_DECAY = 0.9;

export function starsForScore(score: number): number {
  if (score >= 98) return 5;
  if (score >= 89) return 4;
  if (score >= 80) return 3;
  return 2;
}

export function teamScore(ratingScores: number[]): number {
  const sorted = [...ratingScores].sort((a, b) => b - a);
  const weighted = sorted.reduce((sum, score, i) => sum + score * Math.pow(TEAM_SCORE_DECAY, i), 0);
  return Math.round(weighted * 100) / 100;
}

export type TeamClassRanking = {
  rank: number;
  college: { id: string; name: string; shortName: string; slug: string; conference: string; primaryColor: string };
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  total: number;
  avgRating: number;
  score: number;
};

const COMMITTED_STATUSES = ["COMMITTED", "SIGNED", "ENROLLED"];

export async function teamClassRankings(sport: string, classYear: number, conference?: string): Promise<TeamClassRanking[]> {
  const colleges = await db.college.findMany({
    where: conference ? { conference } : undefined,
    include: {
      commits: {
        where: { sport, classYear, status: { in: COMMITTED_STATUSES } },
        include: { ratings: { where: { source: "FAA", kind: "HS" } } },
      },
    },
  });

  const rows = colleges
    .filter((c) => c.commits.length > 0)
    .map((c) => {
      const ratings = c.commits.map((a) => a.ratings[0]).filter(Boolean);
      const scores = ratings.map((r) => r.score);
      return {
        rank: 0,
        college: c,
        fiveStars: ratings.filter((r) => r.stars === 5).length,
        fourStars: ratings.filter((r) => r.stars === 4).length,
        threeStars: ratings.filter((r) => r.stars === 3).length,
        total: c.commits.length,
        avgRating: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0,
        score: teamScore(scores),
      };
    })
    .sort((a, b) => b.score - a.score);

  rows.forEach((row, i) => (row.rank = i + 1));
  return rows;
}

// Recomputes national, position and state ranks for every FAA rating in one sport and class.
export async function recomputeRanks(client: PrismaClient, sport: string, classYear: number, kind = "HS") {
  const ratings = await client.rating.findMany({
    where: { source: "FAA", kind, athlete: { sport, classYear } },
    include: { athlete: true },
    orderBy: { score: "desc" },
  });

  const positionCounts = new Map<string, number>();
  const stateCounts = new Map<string, number>();

  for (const [i, rating] of ratings.entries()) {
    const pos = rating.athlete.position;
    const state = rating.athlete.hometownState ?? "";
    const positionRank = (positionCounts.get(pos) ?? 0) + 1;
    const stateRank = (stateCounts.get(state) ?? 0) + 1;
    positionCounts.set(pos, positionRank);
    stateCounts.set(state, stateRank);

    await client.rating.update({
      where: { id: rating.id },
      data: { nationalRank: i + 1, positionRank, stateRank: state ? stateRank : null, stars: starsForScore(rating.score) },
    });
  }
  return ratings.length;
}
