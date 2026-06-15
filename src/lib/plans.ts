// Planes de suscripción. Client-safe (sin DB).

export type Plan = "demo" | "basic" | "pro";

export const PLAN_PRICES: Record<Exclude<Plan, "demo">, number> = {
  basic: 1,
  pro: 5,
};

export const PRO_DISCOUNT_PCT = 30;

export const PLAN_LABELS: Record<Plan, string> = {
  demo: "Demo",
  basic: "Basic",
  pro: "Pro",
};

// Beneficios por plan. Compartido entre landing, checkout y panel admin.
export const PLAN_PERKS: Record<Plan, string[]> = {
  demo: ["Catálogo y pedidos", "Hero personalizable", "15 días de prueba"],
  basic: ["Todo lo del demo", "Tema y colores propios", "Flash sales y marcas", "Secciones de portada"],
  pro: ["Todo lo de Basic", "Secciones personalizadas", "Múltiples admins", "Soporte prioritario"],
};

export function proDiscountedPrice(): number {
  return +(PLAN_PRICES.pro * (1 - PRO_DISCOUNT_PCT / 100)).toFixed(2);
}
