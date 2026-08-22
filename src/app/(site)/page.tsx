import { getPublishedPage } from "@/lib/data/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { SectionInstance } from "@/components/sections/types";

export default async function HomePage() {
  const result = await getPublishedPage("home");
  const sections = (result?.sections ?? []) as SectionInstance[];

  if (sections.length === 0) {
    return (
      <div className="xp-container py-24 text-center text-slate-400">
        <p className="text-lg font-semibold">Welcome to XperaOne</p>
        <p className="text-sm mt-2">The homepage has not been published yet.</p>
      </div>
    );
  }

  return <SectionRenderer sections={sections} />;
}
