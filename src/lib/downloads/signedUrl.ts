import "server-only";
import crypto from "crypto";

const SECRET = process.env.APP_SECRET || "dev-fallback-secret";

export type SignedPayload = {
  key: string;
  exp: number; // unix ms expiry
  sub: string; // subject identifier (e.g. permission id) for auditing
};

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function createSignedToken(payload: SignedPayload): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySignedToken(token: string): SignedPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Short-lived (default 2 minutes) signed download URL, similar in spirit to a
// Supabase Storage signed URL — the token embeds the private storage key and
// an expiry, and is verified server-side on every request.
export function createDownloadUrl(key: string, subject: string, ttlMs = 2 * 60 * 1000): string {
  const token = createSignedToken({ key, exp: Date.now() + ttlMs, sub: subject });
  return `/api/downloads/file?token=${encodeURIComponent(token)}`;
}
