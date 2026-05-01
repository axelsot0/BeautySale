import { createClient } from "@/lib/supabase/server";
import { mockCategories, mockProducts, mockBanners, mockNews } from "./mock";
import type { Category, Product, Banner, News } from "./types";

/**
 * Server-side fetchers. Each falls back to mock data when the DB has no rows yet,
 * so the home page renders well from day one and switches to real data
 * automatically as the admin populates content.
 */

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error || !data || data.length === 0) return mockCategories;
  return data;
}

export async function getNews(): Promise<News[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true });

  if (error || !data || data.length === 0) return mockNews;
  return data;
}

export async function getBanners(slot?: Banner["slot"]): Promise<Banner[]> {
  const supabase = await createClient();
  let q = supabase.from("banners").select("*").eq("active", true);
  if (slot) q = q.eq("slot", slot);
  const { data, error } = await q.order("position", { ascending: true });

  if (error || !data || data.length === 0) {
    const all = mockBanners;
    return slot ? all.filter((b) => b.slot === slot) : all;
  }
  return data;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return mockProducts.filter((p) => p.featured).slice(0, limit);
  }
  return data;
}

export async function getProductsByCategory(slug: string, limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  const categoryId = cat?.id ?? mockCategories.find((c) => c.slug === slug)?.id;
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return mockProducts.filter((p) => p.category_id === categoryId).slice(0, limit);
  }
  return data;
}

export async function getOnSaleProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("on_sale", true)
    .order("discount_percent", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return mockProducts.filter((p) => p.on_sale).slice(0, limit);
  }
  return data;
}
