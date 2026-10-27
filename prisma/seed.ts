// Seeds the database with FICTIONAL sample data. Every athlete, expert, article and forum post
// here is made up; colleges are real schools used only as reference names.
import { PrismaClient, type College, type HighSchool } from "@prisma/client";
import { recomputeRanks, starsForScore } from "../src/lib/rankings";
import { FOOTBALL_POSITIONS, BASKETBALL_POSITIONS } from "../src/lib/enums";

const db = new PrismaClient();

let seed = 20271;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const daysAgo = (n: number) => new Date(Date.UTC(2026, 9, 27) - n * 86_400_000);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const COLLEGES: [string, string, string, string, string][] = [
  ["Alabama", "BAMA", "SEC", "#9E1B32", "#FFFFFF"],
  ["Georgia", "UGA", "SEC", "#BA0C2F", "#000000"],
  ["Texas", "TEX", "SEC", "#BF5700", "#FFFFFF"],
  ["LSU", "LSU", "SEC", "#461D7C", "#FDD023"],
  ["Texas A&M", "TAMU", "SEC", "#500000", "#FFFFFF"],
  ["Tennessee", "TENN", "SEC", "#FF8200", "#FFFFFF"],
  ["Florida", "UF", "SEC", "#0021A5", "#FA4616"],
  ["Auburn", "AUB", "SEC", "#0C2340", "#E87722"],
  ["Ole Miss", "MISS", "SEC", "#CE1126", "#14213D"],
  ["Oklahoma", "OU", "SEC", "#841617", "#FDF9D8"],
  ["South Carolina", "SC", "SEC", "#73000A", "#000000"],
  ["Ohio State", "OSU", "B1G", "#BB0000", "#666666"],
  ["Michigan", "MICH", "B1G", "#00274C", "#FFCB05"],
  ["Penn State", "PSU", "B1G", "#041E42", "#FFFFFF"],
  ["Oregon", "ORE", "B1G", "#154733", "#FEE123"],
  ["USC", "USC", "B1G", "#990000", "#FFC72C"],
  ["Washington", "UW", "B1G", "#4B2E83", "#B7A57A"],
  ["Nebraska", "NEB", "B1G", "#E41C38", "#FFFFFF"],
  ["Wisconsin", "WIS", "B1G", "#C5050C", "#FFFFFF"],
  ["UCLA", "UCLA", "B1G", "#2D68C4", "#F2A900"],
  ["Clemson", "CLEM", "ACC", "#F56600", "#522D80"],
  ["Miami", "MIA", "ACC", "#F47321", "#005030"],
  ["Florida State", "FSU", "ACC", "#782F40", "#CEB888"],
  ["North Carolina", "UNC", "ACC", "#7BAFD4", "#13294B"],
  ["Louisville", "LOU", "ACC", "#AD0000", "#000000"],
  ["SMU", "SMU", "ACC", "#0033A0", "#C8102E"],
  ["Notre Dame", "ND", "IND", "#0C2340", "#C99700"],
  ["Texas Tech", "TTU", "Big 12", "#CC0000", "#000000"],
  ["Colorado", "COLO", "Big 12", "#CFB87C", "#000000"],
  ["Utah", "UTAH", "Big 12", "#CC0000", "#FFFFFF"],
  ["Arizona State", "ASU", "Big 12", "#8C1D40", "#FFC627"],
  ["BYU", "BYU", "Big 12", "#002E5D", "#FFFFFF"],
  ["Kansas State", "KSU", "Big 12", "#512888", "#FFFFFF"],
  ["Baylor", "BAY", "Big 12", "#154734", "#FFB81C"],
  ["Kentucky", "UK", "SEC", "#0033A0", "#FFFFFF"],
  ["Duke", "DUKE", "ACC", "#003087", "#FFFFFF"],
  ["Kansas", "KU", "Big 12", "#0051BA", "#E8000D"],
  ["Memphis", "MEM", "AAC", "#003087", "#898D8D"],
  ["Boise State", "BSU", "MWC", "#0033A0", "#D64309"],
  ["Tulane", "TUL", "AAC", "#006747", "#418FDE"],
];

const FIRST = ["Jaylen", "Marcus", "Dante", "Elijah", "Isaiah", "Caleb", "Jordan", "Malik", "Xavier", "Trey", "Cam", "Bryce", "Kendrick", "Josiah", "Micah", "Tyrese", "Amari", "Jalen", "Darius", "Quincy", "Zion", "Rashad", "Devin", "Luke", "Carter", "Mason", "Gavin", "Nolan", "Kai", "Andre", "Tavion", "Omari", "Jace", "Brody", "Kingston", "Malachi", "DeShawn", "Ty", "Cole", "Rylan"];
const LAST = ["Washington", "Brooks", "Carter", "Henderson", "Mitchell", "Coleman", "Price", "Bryant", "Simmons", "Foster", "Graham", "Hayes", "Jenkins", "Lawson", "Morrison", "Porter", "Reed", "Sanders", "Tate", "Vaughn", "Walker", "Young", "Bishop", "Crawford", "Dixon", "Ellis", "Fleming", "Gaines", "Harper", "Ingram", "Jefferson", "Kirby", "Lowery", "Monroe", "Nash", "Odom", "Pruitt", "Quarles", "Rollins", "Stallworth"];
const TOWNS: [string, string][] = [
  ["Atlanta", "GA"], ["Valdosta", "GA"], ["Houston", "TX"], ["Dallas", "TX"], ["Austin", "TX"], ["Miami", "FL"], ["Tampa", "FL"], ["Jacksonville", "FL"],
  ["Los Angeles", "CA"], ["Santa Ana", "CA"], ["Charlotte", "NC"], ["Columbus", "OH"], ["Cincinnati", "OH"], ["New Orleans", "LA"], ["Baton Rouge", "LA"],
  ["Birmingham", "AL"], ["Mobile", "AL"], ["Nashville", "TN"], ["Memphis", "TN"], ["Phoenix", "AZ"], ["Detroit", "MI"], ["Philadelphia", "PA"], ["Las Vegas", "NV"], ["Chicago", "IL"],
];
const SCHOOL_WORDS = ["Central", "North", "South", "East", "West", "Lakeside", "Ridge", "Valley", "Heritage", "Liberty", "Westfield", "Grace Prep", "Academy", "Christian", "Oak Hill", "Riverside"];

const FOOTBALL_SIZE: Record<string, [number, number, number, number]> = {
  QB: [73, 77, 195, 225], RB: [68, 72, 190, 215], WR: [70, 76, 170, 205], TE: [75, 78, 225, 250], OT: [77, 80, 290, 320],
  IOL: [74, 77, 290, 320], EDGE: [75, 78, 235, 265], DL: [74, 77, 280, 310], LB: [72, 75, 215, 235], CB: [69, 73, 170, 190],
  S: [71, 74, 185, 205], ATH: [71, 75, 185, 210], K: [70, 74, 170, 195], P: [72, 76, 185, 205], LS: [72, 75, 210, 230],
};
const BASKETBALL_SIZE: Record<string, [number, number, number, number]> = {
  PG: [72, 76, 165, 190], SG: [74, 78, 175, 200], SF: [77, 80, 195, 215], PF: [79, 82, 210, 235], C: [81, 85, 225, 260],
};

async function main() {
  await db.$transaction([
    db.post.deleteMany(), db.thread.deleteMany(), db.board.deleteMany(),
    db.articleAthlete.deleteMany(), db.articleCollege.deleteMany(), db.article.deleteMany(),
    db.prediction.deleteMany(), db.expert.deleteMany(), db.transferEntry.deleteMany(),
    db.commitEvent.deleteMany(), db.visit.deleteMany(), db.offer.deleteMany(), db.rating.deleteMany(),
    db.athlete.deleteMany(), db.highSchool.deleteMany(), db.college.deleteMany(),
    db.subscription.deleteMany(), db.user.deleteMany(),
  ]);

  const colleges: College[] = [];
  for (const [name, shortName, conference, primaryColor, secondaryColor] of COLLEGES) {
    colleges.push(await db.college.create({ data: { name, shortName, conference, primaryColor, secondaryColor, slug: slugify(name) } }));
  }

  const highSchools: HighSchool[] = [];
  for (const [city, state] of TOWNS) {
    for (let i = 0; i < 3; i++) {
      const name: string = `${city} ${SCHOOL_WORDS[(highSchools.length * 5) % SCHOOL_WORDS.length]}`;
      highSchools.push(await db.highSchool.create({ data: { name, city, state, level: name.includes("Prep") || name.includes("Academy") ? "PREP" : "HS" } }));
    }
  }

  const admin = await db.user.create({ data: { email: "admin@futureallamerican.example", displayName: "FAA Admin", role: "ADMIN" } });
  const fans = [];
  for (const handle of ["GridironGuru", "FourStarFan", "PortalWatcher", "SignalCaller", "RedZoneRay", "HoopsHeadquarters"]) {
    const fan = await db.user.create({ data: { email: `${handle.toLowerCase()}@example.com`, displayName: handle, role: rand() > 0.5 ? "MEMBER" : "FAN" } });
    if (fan.role === "MEMBER") await db.subscription.create({ data: { userId: fan.id, plan: "ANNUAL", status: "ACTIVE", renewsAt: daysAgo(-200) } });
    fans.push(fan);
  }

  const experts = [];
  for (const [name, outlet] of [["Sam Okafor", "Future All American"], ["Riley Chen", "Future All American"], ["Dana Whitfield", "FAA Southeast"], ["Marco Delgado", "FAA West"], ["Jess Abernathy", "FAA Midwest"]]) {
    const user = await db.user.create({ data: { email: `${slugify(name)}@futureallamerican.example`, displayName: name, role: "EXPERT" } });
    experts.push(await db.expert.create({ data: { userId: user.id, displayName: name, outlet, bio: `${name} covers recruiting for ${outlet}.` } }));
  }

  const usedSlugs = new Set<string>();
  const createdAthletes: { id: string; first: string; last: string; score: number; position: string; status: string; collegeId?: string; sport: string; classYear: number }[] = [];

  async function makeAthlete(sport: "FOOTBALL" | "BASKETBALL", classYear: number, index: number, total: number) {
    const first = pick(FIRST);
    const last = pick(LAST);
    let slug = slugify(`${first} ${last}`);
    while (usedSlugs.has(slug)) slug = `${slugify(`${first} ${last}`)}-${between(100, 999)}`;
    usedSlugs.add(slug);

    const positions = sport === "FOOTBALL" ? FOOTBALL_POSITIONS.filter((p) => !["K", "P", "LS"].includes(p) || rand() > 0.8) : BASKETBALL_POSITIONS;
    const position = pick(positions);
    const size = (sport === "FOOTBALL" ? FOOTBALL_SIZE : BASKETBALL_SIZE)[position];
    const hs = pick(highSchools);
    // Scores fall off from ~99.5 at the top of the class to ~80 at the bottom.
    const score = Math.round((99.6 - (index / total) * 19 - rand() * 0.6) * 100) / 100;

    const committedChance = classYear === 2027 ? 0.62 : 0.2;
    const committed = rand() < committedChance;
    // Better players land at better programs, loosely.
    const college = committed ? colleges[Math.min(colleges.length - 1, Math.floor(rand() * (8 + (index / total) * 32)))] : undefined;
    const status = committed ? (classYear === 2026 ? "ENROLLED" : "COMMITTED") : "UNCOMMITTED";
    const commitDate = committed ? daysAgo(between(2, 300)) : null;

    const athlete = await db.athlete.create({
      data: {
        slug, firstName: first, lastName: last, sport, classYear, position,
        heightIn: between(size[0], size[1]), weightLb: between(size[2], size[3]),
        hometownCity: hs.city, hometownState: hs.state, highSchoolId: hs.id,
        status, commitDate, committedCollegeId: college?.id,
        nilValuation: score > 95 ? between(25, 120) * 10_000 : score > 90 && rand() > 0.5 ? between(5, 40) * 5_000 : null,
        verified: rand() > 0.7,
        ratings: { create: { source: "FAA", kind: "HS", stars: 3, score, ratedAt: daysAgo(between(1, 120)) } },
      },
    });

    const offerCount = Math.max(1, Math.round((score - 78) / 1.4) + between(-2, 2));
    const offered = new Set<string>(college ? [college.id] : []);
    while (offered.size < Math.min(offerCount, colleges.length)) offered.add(pick(colleges).id);
    for (const collegeId of offered) {
      await db.offer.create({ data: { athleteId: athlete.id, collegeId, offeredAt: daysAgo(between(30, 600)) } });
    }

    const offeredList = [...offered];
    for (let v = 0; v < between(0, 4); v++) {
      await db.visit.create({ data: { athleteId: athlete.id, collegeId: pick(offeredList), type: pick(["OFFICIAL", "UNOFFICIAL", "UNOFFICIAL", "JUNIOR_DAY"]), visitDate: daysAgo(between(-60, 400)) } });
    }
    if (college && commitDate) {
      await db.commitEvent.create({ data: { athleteId: athlete.id, collegeId: college.id, type: "COMMIT", occurredAt: commitDate } });
    }

    createdAthletes.push({ id: athlete.id, first, last, score, position, status, collegeId: college?.id, sport, classYear });
    return { athlete, offeredList, college };
  }

  const classes: ["FOOTBALL" | "BASKETBALL", number, number][] = [["FOOTBALL", 2027, 300], ["FOOTBALL", 2028, 150], ["BASKETBALL", 2027, 100], ["BASKETBALL", 2028, 60]];
  for (const [sport, classYear, total] of classes) {
    for (let i = 0; i < total; i++) {
      const { athlete, offeredList, college } = await makeAthlete(sport, classYear, i, total);
      // Expert predictions on the top of each class.
      if (i < total / 2 && rand() > 0.35) {
        for (let p = 0; p < between(1, 3); p++) {
          const target = college && rand() > 0.3 ? college.id : pick(offeredList);
          const resolved = !!college;
          await db.prediction.create({
            data: {
              athleteId: athlete.id, expertId: pick(experts).id, collegeId: target, confidence: between(40, 95),
              predictedAt: daysAgo(between(10, 320)),
              result: resolved ? (target === college?.id ? "CORRECT" : "INCORRECT") : "PENDING",
              resolvedAt: resolved ? daysAgo(between(1, 9)) : null,
            },
          });
        }
      }
    }
    await recomputeRanks(db, sport, classYear);
  }

  // Transfer portal: college players in class 2024-2025.
  for (let i = 0; i < 80; i++) {
    const sport = i < 60 ? "FOOTBALL" : "BASKETBALL";
    const classYear = pick([2023, 2024, 2025]);
    const from = pick(colleges);
    const first = pick(FIRST);
    const last = pick(LAST);
    const slug = `${slugify(`${first} ${last}`)}-${between(1000, 9999)}`;
    const position = pick(sport === "FOOTBALL" ? FOOTBALL_POSITIONS.slice(0, 12) : BASKETBALL_POSITIONS);
    const size = (sport === "FOOTBALL" ? FOOTBALL_SIZE : BASKETBALL_SIZE)[position];
    const status = pick(["ENTERED", "ENTERED", "COMMITTED", "COMMITTED", "EXPECTED", "ENROLLED", "WITHDRAWN"]);
    const to = ["COMMITTED", "EXPECTED", "ENROLLED"].includes(status) ? pick(colleges.filter((c) => c.id !== from.id)) : null;
    const portalScore = Math.round((97 - i * 0.22 - rand()) * 100) / 100;
    const hsScore = Math.round((86 + rand() * 12) * 100) / 100;
    const athlete = await db.athlete.create({
      data: {
        slug, firstName: first, lastName: last, sport, classYear, position,
        heightIn: between(size[0], size[1]), weightLb: between(size[2], size[3]), status: "ENROLLED",
        committedCollegeId: (status === "ENROLLED" ? to?.id : from.id) ?? from.id,
        nilValuation: portalScore > 92 ? between(10, 90) * 10_000 : null,
        ratings: {
          create: [
            { source: "FAA", kind: "TRANSFER", stars: 3, score: portalScore },
            { source: "FAA", kind: "HS", stars: 3, score: hsScore },
          ],
        },
      },
    });
    await db.transferEntry.create({
      data: {
        athleteId: athlete.id, fromCollegeId: from.id, toCollegeId: to?.id, status,
        eligibility: pick(["SO", "JR", "SR", "GR"]), enteredAt: daysAgo(between(1, 60)),
      },
    });
  }
  for (const year of [2023, 2024, 2025]) {
    for (const sport of ["FOOTBALL", "BASKETBALL"]) {
      await recomputeRanks(db, sport, year, "TRANSFER");
      await recomputeRanks(db, sport, year, "HS");
    }
  }

  // News: a handful of sample stories tied to real rows.
  const top = createdAthletes.filter((a) => a.sport === "FOOTBALL" && a.classYear === 2027).slice(0, 12);
  const hoops = createdAthletes.filter((a) => a.sport === "BASKETBALL" && a.classYear === 2027).slice(0, 4);
  const collegeName = (id?: string) => colleges.find((c) => c.id === id)?.name;
  const stories: { title: string; category: string; premium: boolean; athlete: (typeof top)[number] }[] = [
    ...top.map((a, i) => ({
      title: a.collegeId
        ? `${["", "", "Two", "Three", "Four", "Five"][starsForScore(a.score)]}-star ${a.position} ${a.first} ${a.last} breaks down his commitment to ${collegeName(a.collegeId)}`
        : `Inside the recruitment of uncommitted ${a.position} ${a.first} ${a.last}`,
      category: "FOOTBALL_RECRUITING",
      premium: i % 3 === 1,
      athlete: a,
    })),
    ...hoops.map((a) => ({ title: `${a.first} ${a.last} sets official visit schedule`, category: "BASKETBALL_RECRUITING", premium: false, athlete: a })),
  ];
  for (const [i, story] of stories.entries()) {
    const article = await db.article.create({
      data: {
        slug: slugify(story.title),
        title: story.title,
        category: story.category,
        premium: story.premium,
        excerpt: `Sample story. ${story.athlete.first} ${story.athlete.last} is one of the top prospects in the ${story.athlete.classYear} class.`,
        body: [
          `This is placeholder copy for a sample article. ${story.athlete.first} ${story.athlete.last} carries an FAA rating of ${story.athlete.score.toFixed(2)}.`,
          `Our scouts like his length, motor and production against top competition. Expect his recruitment to stay busy through the summer official visit window.`,
          `Replace this text with your own reporting before launch.`,
        ].join("\n\n"),
        publishedAt: daysAgo(i),
        authorId: pick(experts).userId,
        athletes: { create: { athleteId: story.athlete.id } },
        colleges: story.athlete.collegeId ? { create: { collegeId: story.athlete.collegeId } } : undefined,
      },
    });
    void article;
  }

  // Forums.
  const main = await db.board.create({ data: { slug: "the-main-board", name: "The Main Board", description: "Recruiting talk for every program." } });
  const premium = await db.board.create({ data: { slug: "insider-lounge", name: "Insider Lounge", description: "Members-only intel from FAA experts.", premium: true } });
  const teamBoards = [];
  for (const c of colleges.slice(0, 6)) {
    teamBoards.push(await db.board.create({ data: { slug: `${c.slug}-recruiting`, name: `${c.name} Recruiting`, collegeId: c.id } }));
  }
  const threadTitles = ["Who lands the top QB in 2027?", "Official visit weekend thread", "Portal targets after the season", "Best class in the conference?", "Film room: under-the-radar 3-stars", "NIL collectives and recruiting"];
  for (const board of [main, premium, ...teamBoards]) {
    for (let t = 0; t < between(2, 5); t++) {
      const author = pick(fans);
      const thread = await db.thread.create({ data: { boardId: board.id, title: pick(threadTitles), authorId: author.id, pinned: t === 0 && board.id === main.id, createdAt: daysAgo(between(0, 20)) } });
      for (let p = 0; p < between(1, 6); p++) {
        await db.post.create({ data: { threadId: thread.id, authorId: p === 0 ? author.id : pick(fans).id, body: pick(["Huge get if it happens.", "Hearing good things after the visit.", "Patience. Long way to signing day.", "Film is legit, watch the second half.", "This class is shaping up nicely.", "Sample post, replace with real community content."]), createdAt: daysAgo(between(0, 20)) } });
      }
    }
  }

  void admin;
  console.log(`Seeded ${colleges.length} colleges, ${createdAthletes.length} recruits, 80 transfers, ${stories.length} articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
