export type SectionInstance = {
  id: string;
  type: string;
  enabled: boolean;
  data: Record<string, unknown>;
};

export function str(data: Record<string, unknown>, key: string, fallback = ""): string {
  const v = data[key];
  return typeof v === "string" ? v : fallback;
}

export function num(data: Record<string, unknown>, key: string, fallback = 0): number {
  const v = data[key];
  return typeof v === "number" ? v : fallback;
}

export function arr<T = unknown>(data: Record<string, unknown>, key: string): T[] {
  const v = data[key];
  return Array.isArray(v) ? (v as T[]) : [];
}
