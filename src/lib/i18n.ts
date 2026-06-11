// i18n del storefront. Client-safe. El idioma vive en la cookie bs_locale;
// las rutas /es /en /fr /ht la setean y redirigen de vuelta.
// El contenido cargado por el admin (productos, hero) queda en su idioma.

export const LOCALES = ["es", "en", "fr", "ht"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "bs_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  ht: "Kreyòl",
};

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

type Dict = {
  cart_title: string;
  cart_one: string;
  cart_many: string;
  cart_empty: string;
  keep_shopping: string;
  subtotal: string;
  shipping_note: string;
  go_checkout: string;
  close_cart: string;
  remove: string;
  search: string;
  favorites: string;
  cart: string;
  add_to_cart: string;
};

const ES: Dict = {
  cart_title: "Carrito",
  cart_one: "producto",
  cart_many: "productos",
  cart_empty: "Tu carrito está vacío",
  keep_shopping: "Seguir comprando",
  subtotal: "Subtotal",
  shipping_note: "Envío calculado en el checkout",
  go_checkout: "Ir al checkout →",
  close_cart: "Cerrar carrito",
  remove: "Eliminar",
  search: "Buscar",
  favorites: "Favoritos",
  cart: "Carrito",
  add_to_cart: "Agregar al carrito",
};

const EN: Dict = {
  cart_title: "Cart",
  cart_one: "item",
  cart_many: "items",
  cart_empty: "Your cart is empty",
  keep_shopping: "Keep shopping",
  subtotal: "Subtotal",
  shipping_note: "Shipping calculated at checkout",
  go_checkout: "Go to checkout →",
  close_cart: "Close cart",
  remove: "Remove",
  search: "Search",
  favorites: "Favorites",
  cart: "Cart",
  add_to_cart: "Add to cart",
};

const FR: Dict = {
  cart_title: "Panier",
  cart_one: "article",
  cart_many: "articles",
  cart_empty: "Votre panier est vide",
  keep_shopping: "Continuer vos achats",
  subtotal: "Sous-total",
  shipping_note: "Livraison calculée au paiement",
  go_checkout: "Passer au paiement →",
  close_cart: "Fermer le panier",
  remove: "Supprimer",
  search: "Rechercher",
  favorites: "Favoris",
  cart: "Panier",
  add_to_cart: "Ajouter au panier",
};

const HT: Dict = {
  cart_title: "Panyen",
  cart_one: "pwodui",
  cart_many: "pwodui",
  cart_empty: "Panyen ou vid",
  keep_shopping: "Kontinye achte",
  subtotal: "Sou-total",
  shipping_note: "Livrezon kalkile nan kès la",
  go_checkout: "Ale nan kès la →",
  close_cart: "Fèmen panyen",
  remove: "Retire",
  search: "Chèche",
  favorites: "Favori",
  cart: "Panyen",
  add_to_cart: "Mete nan panyen",
};

const DICTS: Record<Locale, Dict> = { es: ES, en: EN, fr: FR, ht: HT };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? ES;
}

// Lee el locale desde document.cookie (solo cliente).
export function readClientLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const m = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=(\\w+)`));
  const v = m?.[1] ?? "";
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
