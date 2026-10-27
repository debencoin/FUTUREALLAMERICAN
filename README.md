# Future All American

A college sports recruiting site: player and team rankings, a searchable recruit database, commitments, expert predictions, the transfer portal, NIL valuations, news and forums. Its feature set follows On3 Rivals; the brand, code and data are Future All American's own.

**All athletes, ratings, articles and forum posts in the seed data are fictional.** Colleges are real schools used as reference names only (no logos).

## Run it locally

Needs Node.js 20 or newer.

```bash
npm install
cp .env.example .env  # then set ADMIN_PASSWORD and AUTH_SECRET
npm run db:reset     # creates prisma/dev.db and (re)loads sample data, wiping existing rows
npm run dev          # http://localhost:3000
```

## Pages

| Path | What it shows |
| --- | --- |
| `/` | Hero, latest news, latest commits, top 10 players and teams |
| `/rankings/players/[sport]/[year]` | Player rankings with position, state and status filters |
| `/rankings/teams/[sport]/[year]` | Team class rankings by conference |
| `/database` | Search every athlete by name or high school |
| `/athletes/[slug]` | Profile: bio, FAA rating and ranks, offers, visits, predictions, timeline, news |
| `/athletes/[slug]/claim` | How an athlete claims and verifies a profile |
| `/commits` | Commits, decommits, signings, enrollments |
| `/predictions/[sport]/[year]` | Prediction Machine and expert accuracy leaderboard |
| `/portal/[sport]` | Transfer portal with status counts |
| `/nil` | NIL 100 by valuation |
| `/colleges/[slug]` | Team hub: commits, offers, visits |
| `/news`, `/news/[slug]` | Articles; premium stories show a paywall |
| `/boards` | Forums, team boards and a members-only board |
| `/join` | Membership plans (placeholder prices, checkout not live) |
| `/admin` | Password-protected admin: upload athletes and ratings from CSV or Excel |

## Data

The schema is in `prisma/schema.prisma`. Enum-like string fields list their allowed values in comments and in `src/lib/enums.ts`.

- **Ratings and ranks.** Each athlete has one FAA rating per kind (`HS` or `TRANSFER`). National, position and state ranks are stored on the rating and recomputed by `recomputeRanks` in `src/lib/rankings.ts`. Stars come from the score: 98+ is 5 stars, 89+ is 4, 80+ is 3.
- **Team score.** Computed on request from committed athletes' FAA scores, best first, each next commit weighted 10% less (`teamScore`).
- **Importing your own athletes.** Sign in at `/admin` with `ADMIN_PASSWORD` and upload a `.csv` or `.xlsx` file, or run `npm run import:athletes -- path/to/file.csv` (or `.xlsx`). Each row adds or updates an athlete (matched by name and class), their high school, commitment and FAA rating, then every class in the file is re-ranked. Column names are flexible (for example `Player`, `Grad Year`, `Pos`, `Stars`, `Commit`); the accepted names are in `ALIASES` in `src/lib/importAthletes.ts`, and `/admin/template.csv` is a ready-made template. A rating (0-100) or a star count is needed for an athlete to appear in rankings.

## Not built yet

- Accounts and sign-in for fans and athletes (claiming profiles, posting in forums, members-only access); admin sign-in is a single shared password
- Checkout and billing for memberships
- An editor for articles and predictions (today they come from the seed or the database directly)
- A production database (switch the Prisma datasource from SQLite to Postgres before deploying)
