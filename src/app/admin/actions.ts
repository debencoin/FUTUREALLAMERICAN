"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, SESSION_MS, createSessionToken, passwordMatches, verifySessionToken } from "@/lib/auth";
import { importAthletes, parseCsv, parseXlsx, toRecords, type ImportResult } from "@/lib/importAthletes";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!process.env.ADMIN_PASSWORD) return "Admin login is turned off: set ADMIN_PASSWORD in the server environment.";
  if ((process.env.AUTH_SECRET ?? "").length < 32) return "Set AUTH_SECRET (32+ random characters) in the server environment.";
  if (!(await passwordMatches(String(form.get("password") ?? "")))) return "Wrong password.";

  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
  const next = String(form.get("next") ?? "");
  // Only redirect within the admin area.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value))) redirect("/admin/login");
}

export type UploadState = { error?: string; result?: ImportResult; unknownColumns?: string[]; fileName?: string } | null;

const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadAthletes(_prev: UploadState, form: FormData): Promise<UploadState> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV or Excel (.xlsx) file first." };
  if (file.size > MAX_BYTES) return { error: "That file is over 10 MB. Split it into smaller files." };

  const name = file.name.toLowerCase();
  let rows: string[][];
  try {
    if (name.endsWith(".xlsx")) rows = await parseXlsx(await file.arrayBuffer());
    else if (name.endsWith(".csv") || name.endsWith(".txt")) rows = parseCsv(await file.text());
    else return { error: "Only .csv and .xlsx files are supported. In Excel or Google Sheets, use File > Download > CSV." };
  } catch {
    return { error: "Couldn't read that file. Re-save it as .xlsx or .csv and try again." };
  }
  if (rows.length < 2) return { error: "The file needs a header row and at least one athlete." };

  const { records, unknownColumns } = toRecords(rows);
  const result = await importAthletes(db, records);
  revalidatePath("/", "layout");
  return { result, unknownColumns, fileName: file.name };
}
