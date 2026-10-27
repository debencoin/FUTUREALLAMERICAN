"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Admin password"
        className="w-full rounded border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {error && <p className="text-sm font-semibold text-brand">{error}</p>}
      <button disabled={pending} className="w-full rounded bg-ink py-2 font-bold uppercase text-white hover:bg-brand disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
