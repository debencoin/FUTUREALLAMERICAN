import { PageTitle } from "@/components/ui";

export const metadata = { title: "Join" };

const PLANS = [
  { name: "Monthly", price: "$9.99", period: "per month", note: "Cancel anytime" },
  { name: "Annual", price: "$79.99", period: "per year", note: "Save 33%", featured: true },
];

const BENEFITS = [
  "Every premium story and scouting report",
  "Members-only Insider Lounge forum",
  "Full Prediction Machine history and expert intel",
  "Early alerts on commitments and portal moves",
  "Ad-light experience",
];

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Become a member" subtitle="Prices are placeholders until the founders set them. Checkout is not live yet." />
      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded border-2 p-6 ${p.featured ? "border-brand" : "border-zinc-200"}`}>
            <div className="display text-xl">{p.name}</div>
            <div className="mt-2 text-4xl font-black">{p.price}</div>
            <div className="text-sm text-zinc-500">{p.period}</div>
            <div className="mt-2 text-sm font-semibold text-brand">{p.note}</div>
            <button disabled className="mt-4 w-full cursor-not-allowed rounded bg-ink py-2 font-bold uppercase text-white opacity-60">
              Coming soon
            </button>
          </div>
        ))}
      </div>
      <ul className="mt-8 space-y-2">
        {BENEFITS.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-brand">★</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
