import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Reads platform_settings.demo_mode once per request (React cache).
// Defaults to true on any error so the storefront never ends up blank by accident.
export const getDemoMode = cache(async (): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("demo_mode")
      .eq("id", 1)
      .single();
    return data?.demo_mode !== false;
  } catch {
    return true;
  }
});
