import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Private storage root — intentionally OUTSIDE the `public/` directory so files
// are never reachable via a direct static URL. All access must go through
// authenticated + authorized API routes that issue short-lived signed URLs.
const STORAGE_ROOT = path.join(process.cwd(), "storage");

export type StorageBucket = "product-files" | "payment-proofs" | "invoices";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export function buildStorageKey(bucket: StorageBucket, originalName: string): string {
  const ext = path.extname(originalName) || "";
  const safeBase = crypto.randomBytes(16).toString("hex");
  return `${bucket}/${safeBase}${ext}`;
}

export async function savePrivateFile(key: string, buffer: Buffer): Promise<void> {
  const fullPath = path.join(STORAGE_ROOT, key);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, buffer);
}

export async function readPrivateFile(key: string): Promise<Buffer> {
  const fullPath = safeResolve(key);
  return fs.readFile(fullPath);
}

export async function deletePrivateFile(key: string): Promise<void> {
  try {
    const fullPath = safeResolve(key);
    await fs.unlink(fullPath);
  } catch {
    // ignore missing file
  }
}

// Prevent path traversal — key must resolve inside STORAGE_ROOT.
function safeResolve(key: string): string {
  const fullPath = path.join(STORAGE_ROOT, key);
  const normalizedRoot = path.normalize(STORAGE_ROOT + path.sep);
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(normalizedRoot)) {
    throw new Error("Invalid storage key");
  }
  return normalizedPath;
}
