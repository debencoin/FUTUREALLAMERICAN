import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/ui";

// Claiming needs accounts and identity checks (parent/guardian consent for minors);
// this page collects the request so staff can verify it by hand until auth ships.
export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const athlete = await db.athlete.findUnique({ where: { slug: (await params).slug } });
  if (!athlete) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title={`Claim ${athlete.firstName} ${athlete.lastName}`} subtitle="Athletes and parents can claim a profile to update measurables, film and contact info." />
      <ol className="mb-6 list-decimal space-y-1 pl-5 text-sm">
        <li>Create a Future All American account.</li>
        <li>Verify your identity (athletes under 18 need a parent or guardian).</li>
        <li>Our staff confirms with your high school coach, then marks the profile Verified.</li>
      </ol>
      <p className="rounded bg-panel p-4 text-sm">
        Account sign-up is not live yet. Until it is, email <span className="font-semibold">claims@futureallamerican.example</span> with the athlete&apos;s name, school and a contact for the head coach.
      </p>
      <Link href={`/athletes/${athlete.slug}`} className="mt-6 inline-block font-semibold text-brand hover:underline">
        Back to profile
      </Link>
    </div>
  );
}
