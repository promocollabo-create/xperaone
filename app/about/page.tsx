import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();

  return (
    <div className="container section legal-page">
      <h1>About {settings?.site_name ?? "XperaOne"}</h1>
      <p>
        {settings?.site_name ?? "XperaOne"} is a digital marketplace built for creators, marketers,
        and businesses who want premium software, automation tools, and digital products —
        delivered instantly, backed by real support.
      </p>
      <style>{`.legal-page { max-width: 720px; } h1 { font-size: 30px; margin-bottom: 16px; } p { margin-bottom: 14px; }`}</style>
    </div>
  );
}
