import { createClient } from "@/lib/supabase/server";
import FaqAccordion from "@/components/FaqAccordion";

export const revalidate = 0;

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  return <FaqAccordion faqs={faqs ?? []} />;
}
