import { LoginForm } from "./LoginForm";
import { one, type SearchParams } from "@/lib/params";

export const metadata = { title: "Admin sign in" };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="display mb-4 text-2xl">
        Admin <span className="text-brand">sign in</span>
      </h1>
      <LoginForm next={one((await searchParams).next)} />
    </div>
  );
}
