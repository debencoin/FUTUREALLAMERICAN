import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "/rankings/players/football/2027", label: "Player Rankings" },
  { href: "/rankings/teams/football/2027", label: "Team Rankings" },
  { href: "/database", label: "Database" },
  { href: "/commits", label: "Commits" },
  { href: "/predictions/football/2027", label: "Predictions" },
  { href: "/portal/football", label: "Transfer Portal" },
  { href: "/nil", label: "NIL" },
  { href: "/news", label: "News" },
  { href: "/boards", label: "Forums" },
];

export function SiteHeader() {
  return (
    <header className="bg-ink text-white">
      <div className="bg-brand py-1 text-center text-xs font-semibold tracking-wide">
        Sample data only: all athletes, ratings and stories shown are fictional.
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image src="/brand/logo.jpeg" alt="Future All American" width={60} height={60} className="rounded-full" priority />
          <span className="display hidden text-lg leading-none sm:block">
            Future <span className="text-brand">All American</span>
          </span>
        </Link>
        <form action="/database" className="ml-auto hidden md:block">
          <input
            name="q"
            placeholder="Search athletes"
            className="w-56 rounded bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </form>
        <Link href="/join" className="ml-auto rounded bg-brand px-4 py-1.5 text-sm font-bold uppercase hover:bg-brand-dark md:ml-0">
          Join
        </Link>
      </div>
      <nav className="border-t border-zinc-800">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 text-sm font-semibold">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block whitespace-nowrap px-3 py-2 text-zinc-200 hover:text-white hover:underline decoration-brand decoration-2 underline-offset-8">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
