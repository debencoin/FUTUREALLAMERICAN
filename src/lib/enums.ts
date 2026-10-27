// Allowed values for string fields in prisma/schema.prisma.

export const SPORTS = ["FOOTBALL", "BASKETBALL"] as const;
export type Sport = (typeof SPORTS)[number];

export const FOOTBALL_POSITIONS = ["QB", "RB", "WR", "TE", "OT", "IOL", "EDGE", "DL", "LB", "CB", "S", "ATH", "K", "P", "LS"];
export const BASKETBALL_POSITIONS = ["PG", "SG", "SF", "PF", "C"];

export const ATHLETE_STATUSES = ["UNCOMMITTED", "COMMITTED", "SIGNED", "ENROLLED"] as const;
export const TRANSFER_STATUSES = ["ENTERED", "COMMITTED", "EXPECTED", "ENROLLED", "WITHDRAWN"] as const;
export const ARTICLE_CATEGORIES: Record<string, string> = {
  FOOTBALL_RECRUITING: "Football Recruiting",
  BASKETBALL_RECRUITING: "Basketball Recruiting",
  HIGH_SCHOOL: "High School",
  TRANSFER_PORTAL: "Transfer Portal",
  NIL: "NIL",
};

export const CONFERENCES = ["SEC", "B1G", "ACC", "Big 12", "IND", "AAC", "MWC"];

export function sportFromParam(param: string): Sport | null {
  const upper = param.toUpperCase();
  return (SPORTS as readonly string[]).includes(upper) ? (upper as Sport) : null;
}

export function positionsFor(sport: Sport): string[] {
  return sport === "FOOTBALL" ? FOOTBALL_POSITIONS : BASKETBALL_POSITIONS;
}
