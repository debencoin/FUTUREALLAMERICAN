"use client";

import { useActionState } from "react";
import { uploadAthletes, type UploadState } from "./actions";

export function UploadForm() {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadAthletes, null);
  const result = state?.result;

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-wrap items-center gap-3 rounded bg-panel p-4">
        <input type="file" name="file" accept=".csv,.xlsx,text/csv" required className="text-sm" />
        <button disabled={pending} className="rounded bg-brand px-4 py-2 text-sm font-bold uppercase text-white hover:bg-brand-dark disabled:opacity-60">
          {pending ? "Importing..." : "Upload"}
        </button>
      </form>

      {state?.error && <p className="rounded border border-brand p-3 text-sm font-semibold text-brand">{state.error}</p>}

      {result && (
        <div className="rounded border p-4 text-sm">
          <p className="font-bold">
            {state.fileName}: {result.created} added, {result.updated} updated, {result.skipped.length} skipped of {result.total} rows.
          </p>
          {result.reranked.length > 0 && <p className="mt-1 text-zinc-600">Re-ranked: {result.reranked.join(", ")}.</p>}
          {state.unknownColumns && state.unknownColumns.length > 0 && (
            <p className="mt-1 text-zinc-600">Ignored columns: {state.unknownColumns.join(", ")}.</p>
          )}
          {result.skipped.length > 0 && (
            <>
              <h3 className="mt-3 font-bold">Skipped rows</h3>
              <ul className="mt-1 list-disc pl-5">
                {result.skipped.slice(0, 50).map((s) => (
                  <li key={s.row}>
                    Row {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.warnings.length > 0 && (
            <>
              <h3 className="mt-3 font-bold">Warnings</h3>
              <ul className="mt-1 list-disc pl-5">
                {result.warnings.slice(0, 50).map((w, i) => (
                  <li key={i}>
                    Row {w.row}: {w.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
