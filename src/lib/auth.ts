// Admin session: a cookie holding "<expiry ms>.<HMAC-SHA256 of expiry>" signed with AUTH_SECRET.
// Uses Web Crypto so the same code runs in middleware (edge) and in server actions (Node).

export const ADMIN_COOKIE = "faa_admin";
export const SESSION_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return value;
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2) return null;
  return new Uint8Array(hex.match(/../g)!.map((b) => parseInt(b, 16)));
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_MS);
  const sig = await crypto.subtle.sign("HMAC", await key(), encoder.encode(expires));
  return `${expires}.${toHex(sig)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [expires, sigHex] = token.split(".");
  const sig = sigHex ? fromHex(sigHex) : null;
  if (!expires || !sig || !(Number(expires) > now)) return false;
  try {
    // crypto.subtle.verify compares in constant time.
    return await crypto.subtle.verify("HMAC", await key(), sig, encoder.encode(expires));
  } catch {
    return false;
  }
}

// Compares two strings without revealing where they first differ.
export async function passwordMatches(given: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([given, expected].map((s) => crypto.subtle.digest("SHA-256", encoder.encode(s))));
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
