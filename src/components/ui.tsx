import Link from "next/link";
import { pad2 } from "@/lib/format";

export function Stars({ count }: { count: number }) {
  return (
    <span className="whitespace-nowrap text-brand" aria-label={`${count} stars`}>
      {"★".repeat(count)}
      <span className="text-zinc-300">{"★".repeat(Math.max(0, 5 - count))}</span>
    </span>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  return <span className="display inline-block w-10 text-xl text-ink">{pad2(rank)}</span>;
}

export function CollegeChip({ college }: { college: { name: string; shortName: string; slug: string; primaryColor: string } }) {
  return (
    <Link href={`/colleges/${college.slug}`} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
      <span
        className="inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[10px] font-black text-white"
        style={{ backgroundColor: college.primaryColor }}
      >
        {college.shortName}
      </span>
      {college.name}
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const color =
    status === "UNCOMMITTED" || status === "ENTERED"
      ? "bg-zinc-200 text-zinc-700"
      : status === "WITHDRAWN"
        ? "bg-zinc-100 text-zinc-500"
        : "bg-brand text-white";
  return <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${color}`}>{status.toLowerCase()}</span>;
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 border-b-4 border-brand pb-3">
      <h1 className="display text-3xl text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
    </div>
  );
}

export function SectionTitle({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between border-b-2 border-ink pb-1">
      <h2 className="display text-lg">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-bold uppercase text-brand hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

type Option = { value: string; label: string };

// A plain GET form so filters work without client JavaScript and URLs stay shareable.
export function FilterBar({ action, selects, query }: { action: string; selects: { name: string; value: string; options: Option[] }[]; query?: string }) {
  return (
    <form action={action} className="mb-4 flex flex-wrap items-center gap-2 rounded bg-panel p-3 text-sm">
      {query !== undefined && (
        <input name="q" defaultValue={query} placeholder="Search name" className="rounded border border-zinc-300 bg-white px-2 py-1" />
      )}
      {selects.map((s) => (
        <select key={s.name} name={s.name} defaultValue={s.value} className="rounded border border-zinc-300 bg-white px-2 py-1">
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      <button className="rounded bg-ink px-3 py-1 font-semibold text-white hover:bg-brand">Apply</button>
    </form>
  );
}

export function Pager({ page, pageCount, makeHref }: { page: number; pageCount: number; makeHref: (page: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      {page > 1 && <Link className="rounded border px-3 py-1 hover:bg-panel" href={makeHref(page - 1)}>Previous</Link>}
      <span>
        Page {page} of {pageCount}
      </span>
      {page < pageCount && <Link className="rounded border px-3 py-1 hover:bg-panel" href={makeHref(page + 1)}>Next 50</Link>}
    </div>
  );
}
