import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-ink py-8 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-4">
        <p>
          <span className="display text-white">
            Future <span className="text-brand">All American</span>
          </span>{" "}
          &copy; {new Date().getFullYear()}
        </p>
        <div className="flex gap-4">
          <Link href="/join" className="hover:text-white">Membership</Link>
          <Link href="/news" className="hover:text-white">News</Link>
          <Link href="/boards" className="hover:text-white">Forums</Link>
        </div>
      </div>
    </footer>
  );
}
