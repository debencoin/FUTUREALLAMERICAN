import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/ui";
import { logout } from "./actions";
import { UploadForm } from "./UploadForm";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [athletes, rated, colleges, latest] = await Promise.all([
    db.athlete.count(),
    db.rating.count({ where: { source: "FAA" } }),
    db.college.findMany({ select: { name: true, shortName: true }, orderBy: { name: "asc" } }),
    db.athlete.findMany({ orderBy: { updatedAt: "desc" }, take: 8, select: { slug: true, firstName: true, lastName: true, classYear: true, position: true, updatedAt: true } }),
  ]);

  return (
    <>
      <div className="flex items-start justify-between">
        <PageTitle title="Admin" subtitle={`${athletes} athletes · ${rated} FAA ratings`} />
        <form action={logout}>
          <button className="text-sm font-semibold text-zinc-500 hover:text-brand">Sign out</button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="display mb-2 text-lg">Upload athletes and ratings</h2>
          <p className="mb-4 text-sm text-zinc-600">
            Upload a CSV or Excel file with one athlete per row. Existing athletes (same name and class) are updated, new ones are added, and every class in
            the file is re-ranked. <Link href="/admin/template.csv" className="font-semibold text-brand hover:underline">Download the template</Link>.
          </p>
          <UploadForm />
        </section>

        <aside className="space-y-6 text-sm">
          <div>
            <h3 className="mb-1 font-bold uppercase">Columns</h3>
            <p className="text-zinc-600">Required: first and last name (or one name column), sport, class, position.</p>
            <p className="mt-1 text-zinc-600">Optional: height, weight, high school, city, state, rating (0-100) or stars, status, committed to, NIL.</p>
          </div>
          <div>
            <h3 className="mb-1 font-bold uppercase">College names for &quot;committed to&quot;</h3>
            <p className="text-zinc-600">{colleges.map((c) => `${c.name} (${c.shortName})`).join(", ")}</p>
          </div>
          <div>
            <h3 className="mb-1 font-bold uppercase">Recently changed</h3>
            <ul className="space-y-1">
              {latest.map((a) => (
                <li key={a.slug}>
                  <Link href={`/athletes/${a.slug}`} className="font-semibold hover:text-brand">
                    {a.firstName} {a.lastName}
                  </Link>{" "}
                  <span className="text-zinc-500">
                    {a.classYear} {a.position}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
