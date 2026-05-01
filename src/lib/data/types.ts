import type { Database } from "@/lib/supabase/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type News = Database["public"]["Tables"]["news"]["Row"];

export type ProductWithCategory = Product & {
  category: Pick<Category, "name" | "slug" | "color"> | null;
};
