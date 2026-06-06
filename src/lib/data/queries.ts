import { createClient } from "@/lib/supabase/server";
import { mockCategories, mockProducts, mockBanners, mockNews, mockFlashSale, mockBrands } from "./mock";
import { getDemoMode } from "./demo";
import { DEFAULT_EDITORIAL_EYEBROW, DEFAULT_EDITORIAL_TITLE } from "@/lib/theme";
import { parseSocialLinks, type SocialLinks } from "@/lib/social";
import type { Category, Product, Banner, News, FlashSale, Brand } from "./types";

export async function getSocialLinks(): Promise<SocialLinks> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("social_links")
    .eq("id", 1)
    .single();
  return parseSocialLinks(data?.social_links);
}

export async function getEditorialHeading(): Promise<{ eyebrow: string; title: string }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("editorial_eyebrow, editorial_title")
    .eq("id", 1)
    .single();
  return {
    eyebrow: data?.editorial_eyebrow?.trim() || DEFAULT_EDITORIAL_EYEBROW,
    title: data?.editorial_title?.trim() || DEFAULT_EDITORIAL_TITLE,
  };
}

/**
 * Server-side fetchers. When the DB has no rows AND demo mode is on, they fall back
 * to built-in sample data. With demo mode off, they return empty/null (real data only).
 */

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error || !data || data.length === 0) return (await getDemoMode()) ? mockCategories : [];
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (!(await getDemoMode())) return null;
    return mockCategories.find((c) => c.slug === slug) ?? null;
  }
  return data;
}

export async function getNews(): Promise<News[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true });

  if (error || !data || data.length === 0) return (await getDemoMode()) ? mockNews : [];
  return data;
}

export async function getBanners(slot?: Banner["slot"]): Promise<Banner[]> {
  const supabase = await createClient();
  let q = supabase.from("banners").select("*").eq("active", true);
  if (slot) q = q.eq("slot", slot);
  const { data, error } = await q.order("position", { ascending: true });

  if (error || !data || data.length === 0) {
    if (!(await getDemoMode())) return [];
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
    if (!(await getDemoMode())) return [];
    return mockProducts.filter((p) => p.featured).slice(0, limit);
  }
  return data;
}

export async function getProductsByCategory(slug: string, limit = 48): Promise<Product[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  const demo = await getDemoMode();
  const categoryId = cat?.id ?? (demo ? mockCategories.find((c) => c.slug === slug)?.id : undefined);
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (!demo) return [];
    return mockProducts.filter((p) => p.category_id === categoryId).slice(0, limit);
  }
  return data;
}

export async function getProductBySlug(
  slug: string,
): Promise<(Product & { category: { name: string; slug: string; color: string } | null }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name, slug, color)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (!(await getDemoMode())) return null;
    const mock = mockProducts.find((p) => p.slug === slug);
    if (!mock) return null;
    const cat = mockCategories.find((c) => c.id === mock.category_id);
    return {
      ...mock,
      category: cat ? { name: cat.name, slug: cat.slug, color: cat.color } : null,
    };
  }
  return data as Product & { category: { name: string; slug: string; color: string } | null };
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeSlug: string,
  limit = 4,
): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (!(await getDemoMode())) return [];
    return mockProducts
      .filter((p) => p.category_id === categoryId && p.slug !== excludeSlug)
      .slice(0, limit);
  }
  return data;
}

// Flash sale: once the admin saves a row it owns the behavior (active=false => hidden).
// While no row exists, demo mode decides whether to show the sample flash sale.
export async function getActiveFlashSale(): Promise<FlashSale | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("flash_sale").select("*").eq("id", 1).maybeSingle();

  if (data) return data.active ? data : null;
  return (await getDemoMode()) ? mockFlashSale : null;
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true });

  if (error || !data || data.length === 0) return (await getDemoMode()) ? mockBrands : [];
  return data;
}

export async function getOnSaleProducts(limit = 48): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("on_sale", true)
    .order("discount_percent", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (!(await getDemoMode())) return [];
    return mockProducts.filter((p) => p.on_sale).slice(0, limit);
  }
  return data;
}
