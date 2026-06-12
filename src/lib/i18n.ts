// i18n del storefront. Client-safe. El idioma vive en la cookie bs_locale;
// las rutas /es /en /fr /ht la setean y redirigen de vuelta.
// El contenido cargado por el admin (productos, hero) queda en su idioma.
// Server components: usar getServerLocale() de i18n-server.ts.

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

// Interpola {clave} en plantillas: fmt(t.sale_count, { n: 5, m: 40 })
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

type Dict = {
  // carrito
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
  reviews: string;
  // listados / secciones
  view_all: string;
  view_all_products: string;
  view_whole_category: string;
  view_all_featured: string;
  top_eyebrow: string;
  top_title: string;
  top_subtitle: string;
  cats_eyebrow: string;
  cats_title: string;
  products_word: string;
  // flash sale
  d_days: string;
  d_hours: string;
  d_min: string;
  d_sec: string;
  shop_sale: string;
  // footer
  f_categories: string;
  f_contact: string;
  f_about: string;
  made_with: string;
  // newsletter
  nl_want: string;
  nl_sending: string;
  nl_welcome_prefix: string;
  nl_check_mail: string;
  nl_copy: string;
  nl_valid_note: string;
  nl_err_subscribed: string;
  nl_err_claimed: string;
  nl_err_email: string;
  nl_err_server: string;
  // búsqueda / filtros
  search_placeholder: string;
  search_for: string;
  search_in: string;
  no_results: string;
  no_results_sub: string;
  clear_filters: string;
  sort_label: string;
  sort_recent: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_discount: string;
  cat_label: string;
  all_f: string;
  filter_btn: string;
  // ofertas
  sale_active: string;
  sale_count: string;
  sale_soon: string;
  stat_products: string;
  stat_avg: string;
  stat_upto: string;
  sale_empty_title: string;
  sale_empty_sub: string;
  view_catalog: string;
  // checkout
  co_contact: string;
  co_name: string;
  co_phone: string;
  co_optional: string;
  co_shipping: string;
  co_street: string;
  co_city: string;
  co_state: string;
  co_zip: string;
  co_country: string;
  co_summary: string;
  co_discount_code: string;
  co_apply: string;
  co_discount: string;
  co_shipping_calc: string;
  co_total: string;
  co_pay_paypal: string;
  co_processing: string;
  co_pay_wa: string;
  co_wa_note: string;
  co_or: string;
  back_home: string;
  co_err_code: string;
  co_err_code_used: string;
  co_err_validate: string;
  co_err_order: string;
  co_err_conn: string;
  co_err_no_url: string;
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
  reviews: "reseñas",
  view_all: "Ver todos",
  view_all_products: "Ver todos los productos",
  view_whole_category: "Ver toda la categoría",
  view_all_featured: "Ver todos los destacados",
  top_eyebrow: "🔥 top ventas",
  top_title: "Lo más amado",
  top_subtitle: "Lo que más eligen este mes.",
  cats_eyebrow: "💖 categorías",
  cats_title: "Encontrá lo tuyo",
  products_word: "productos",
  d_days: "días",
  d_hours: "hs",
  d_min: "min",
  d_sec: "seg",
  shop_sale: "Comprar ofertas",
  f_categories: "Categorías",
  f_contact: "Contacto",
  f_about: "Nosotros",
  made_with: "Hecho con",
  nl_want: "Quiero el",
  nl_sending: "Enviando…",
  nl_welcome_prefix: "¡Bienvenida!",
  nl_check_mail: "Revisá tu correo — te enviamos el código. También lo tenés acá:",
  nl_copy: "copiar",
  nl_valid_note: "Válido para tu primera compra. No acumulable.",
  nl_err_subscribed: "Este correo ya está registrado. Revisá tu bandeja de entrada.",
  nl_err_claimed: "Ya recibiste tu código de bienvenida en este dispositivo.",
  nl_err_email: "Ingresá un correo válido.",
  nl_err_server: "Ocurrió un error. Intentá de nuevo en un momento.",
  search_placeholder: "Buscar productos…",
  search_for: "para",
  search_in: "en",
  no_results: "Sin resultados",
  no_results_sub: "Probá con otro término o eliminá los filtros.",
  clear_filters: "Limpiar filtros",
  sort_label: "Ordenar",
  sort_recent: "Más recientes",
  sort_price_asc: "Menor precio",
  sort_price_desc: "Mayor precio",
  sort_discount: "Mayor descuento",
  cat_label: "Categoría",
  all_f: "Todas",
  filter_btn: "Filtrar",
  sale_active: "Ofertas activas",
  sale_count: "{n} productos con descuentos hasta -{m}%",
  sale_soon: "Pronto vamos a tener ofertas activas",
  stat_products: "Productos",
  stat_avg: "Desc. promedio",
  stat_upto: "Hasta",
  sale_empty_title: "Sin ofertas todavía",
  sale_empty_sub: "Volvé pronto, vienen descuentos imperdibles.",
  view_catalog: "Ver catálogo completo",
  co_contact: "Datos de contacto",
  co_name: "Nombre completo",
  co_phone: "Teléfono",
  co_optional: "(opcional)",
  co_shipping: "Dirección de envío",
  co_street: "Calle y número",
  co_city: "Ciudad",
  co_state: "Provincia",
  co_zip: "Código postal",
  co_country: "País",
  co_summary: "Resumen del pedido",
  co_discount_code: "Código de descuento",
  co_apply: "Aplicar",
  co_discount: "Descuento",
  co_shipping_calc: "A calcular",
  co_total: "Total",
  co_pay_paypal: "Pagar con PayPal →",
  co_processing: "Procesando…",
  co_pay_wa: "Pedir por WhatsApp",
  co_wa_note: "Se registrará tu pedido y te abriremos WhatsApp con el resumen listo para enviar.",
  co_or: "o",
  back_home: "Volver al inicio",
  co_err_code: "Código inválido",
  co_err_code_used: "Este código ya fue usado",
  co_err_validate: "Error al validar. Intentá de nuevo.",
  co_err_order: "Error al procesar el pedido",
  co_err_conn: "Error de conexión. Intentá de nuevo.",
  co_err_no_url: "No se recibió URL de pago",
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
  reviews: "reviews",
  view_all: "View all",
  view_all_products: "View all products",
  view_whole_category: "View whole category",
  view_all_featured: "View all featured",
  top_eyebrow: "🔥 top sellers",
  top_title: "Most loved",
  top_subtitle: "What everyone's choosing this month.",
  cats_eyebrow: "💖 categories",
  cats_title: "Find your thing",
  products_word: "products",
  d_days: "days",
  d_hours: "hrs",
  d_min: "min",
  d_sec: "sec",
  shop_sale: "Shop the sale",
  f_categories: "Categories",
  f_contact: "Contact",
  f_about: "About us",
  made_with: "Made with",
  nl_want: "Give me the",
  nl_sending: "Sending…",
  nl_welcome_prefix: "Welcome!",
  nl_check_mail: "Check your inbox — we sent you the code. It's also right here:",
  nl_copy: "copy",
  nl_valid_note: "Valid on your first purchase. Not stackable.",
  nl_err_subscribed: "This email is already registered. Check your inbox.",
  nl_err_claimed: "You already got your welcome code on this device.",
  nl_err_email: "Enter a valid email.",
  nl_err_server: "Something went wrong. Try again in a moment.",
  search_placeholder: "Search products…",
  search_for: "for",
  search_in: "in",
  no_results: "No results",
  no_results_sub: "Try another term or clear the filters.",
  clear_filters: "Clear filters",
  sort_label: "Sort",
  sort_recent: "Newest",
  sort_price_asc: "Lowest price",
  sort_price_desc: "Highest price",
  sort_discount: "Biggest discount",
  cat_label: "Category",
  all_f: "All",
  filter_btn: "Filter",
  sale_active: "Active deals",
  sale_count: "{n} products with discounts up to -{m}%",
  sale_soon: "Deals coming soon",
  stat_products: "Products",
  stat_avg: "Avg. discount",
  stat_upto: "Up to",
  sale_empty_title: "No deals yet",
  sale_empty_sub: "Come back soon — big discounts on the way.",
  view_catalog: "View full catalog",
  co_contact: "Contact details",
  co_name: "Full name",
  co_phone: "Phone",
  co_optional: "(optional)",
  co_shipping: "Shipping address",
  co_street: "Street and number",
  co_city: "City",
  co_state: "State / Province",
  co_zip: "Zip code",
  co_country: "Country",
  co_summary: "Order summary",
  co_discount_code: "Discount code",
  co_apply: "Apply",
  co_discount: "Discount",
  co_shipping_calc: "Calculated later",
  co_total: "Total",
  co_pay_paypal: "Pay with PayPal →",
  co_processing: "Processing…",
  co_pay_wa: "Order via WhatsApp",
  co_wa_note: "Your order will be saved and WhatsApp will open with the summary ready to send.",
  co_or: "or",
  back_home: "Back to home",
  co_err_code: "Invalid code",
  co_err_code_used: "This code was already used",
  co_err_validate: "Validation failed. Try again.",
  co_err_order: "Could not process the order",
  co_err_conn: "Connection error. Try again.",
  co_err_no_url: "No payment URL received",
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
  reviews: "avis",
  view_all: "Voir tout",
  view_all_products: "Voir tous les produits",
  view_whole_category: "Voir toute la catégorie",
  view_all_featured: "Voir tous les favoris",
  top_eyebrow: "🔥 meilleures ventes",
  top_title: "Les plus aimés",
  top_subtitle: "Les choix préférés ce mois-ci.",
  cats_eyebrow: "💖 catégories",
  cats_title: "Trouvez votre bonheur",
  products_word: "produits",
  d_days: "jours",
  d_hours: "hrs",
  d_min: "min",
  d_sec: "sec",
  shop_sale: "Voir les promos",
  f_categories: "Catégories",
  f_contact: "Contact",
  f_about: "À propos",
  made_with: "Fait avec",
  nl_want: "Je veux les",
  nl_sending: "Envoi…",
  nl_welcome_prefix: "Bienvenue !",
  nl_check_mail: "Vérifiez votre boîte mail — le code est aussi ici :",
  nl_copy: "copier",
  nl_valid_note: "Valable sur votre premier achat. Non cumulable.",
  nl_err_subscribed: "Cet email est déjà inscrit. Vérifiez votre boîte de réception.",
  nl_err_claimed: "Vous avez déjà reçu votre code de bienvenue sur cet appareil.",
  nl_err_email: "Entrez un email valide.",
  nl_err_server: "Une erreur est survenue. Réessayez dans un instant.",
  search_placeholder: "Rechercher des produits…",
  search_for: "pour",
  search_in: "dans",
  no_results: "Aucun résultat",
  no_results_sub: "Essayez un autre terme ou effacez les filtres.",
  clear_filters: "Effacer les filtres",
  sort_label: "Trier",
  sort_recent: "Plus récents",
  sort_price_asc: "Prix croissant",
  sort_price_desc: "Prix décroissant",
  sort_discount: "Plus grosse remise",
  cat_label: "Catégorie",
  all_f: "Toutes",
  filter_btn: "Filtrer",
  sale_active: "Promos en cours",
  sale_count: "{n} produits avec des remises jusqu'à -{m}%",
  sale_soon: "Des promos arrivent bientôt",
  stat_products: "Produits",
  stat_avg: "Remise moy.",
  stat_upto: "Jusqu'à",
  sale_empty_title: "Pas encore de promos",
  sale_empty_sub: "Revenez vite, de belles remises arrivent.",
  view_catalog: "Voir tout le catalogue",
  co_contact: "Coordonnées",
  co_name: "Nom complet",
  co_phone: "Téléphone",
  co_optional: "(facultatif)",
  co_shipping: "Adresse de livraison",
  co_street: "Rue et numéro",
  co_city: "Ville",
  co_state: "Province",
  co_zip: "Code postal",
  co_country: "Pays",
  co_summary: "Récapitulatif",
  co_discount_code: "Code de réduction",
  co_apply: "Appliquer",
  co_discount: "Remise",
  co_shipping_calc: "À calculer",
  co_total: "Total",
  co_pay_paypal: "Payer avec PayPal →",
  co_processing: "Traitement…",
  co_pay_wa: "Commander via WhatsApp",
  co_wa_note: "Votre commande sera enregistrée et WhatsApp s'ouvrira avec le récapitulatif prêt à envoyer.",
  co_or: "ou",
  back_home: "Retour à l'accueil",
  co_err_code: "Code invalide",
  co_err_code_used: "Ce code a déjà été utilisé",
  co_err_validate: "Erreur de validation. Réessayez.",
  co_err_order: "Impossible de traiter la commande",
  co_err_conn: "Erreur de connexion. Réessayez.",
  co_err_no_url: "Aucune URL de paiement reçue",
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
  reviews: "avi",
  view_all: "Wè tout",
  view_all_products: "Wè tout pwodui yo",
  view_whole_category: "Wè tout kategori a",
  view_all_featured: "Wè tout pi popilè yo",
  top_eyebrow: "🔥 pi vann yo",
  top_title: "Sa moun pi renmen",
  top_subtitle: "Sa tout moun ap chwazi mwa sa a.",
  cats_eyebrow: "💖 kategori",
  cats_title: "Jwenn sa w vle",
  products_word: "pwodui",
  d_days: "jou",
  d_hours: "è",
  d_min: "min",
  d_sec: "sgd",
  shop_sale: "Achte rabè yo",
  f_categories: "Kategori",
  f_contact: "Kontak",
  f_about: "Sou nou",
  made_with: "Fèt ak",
  nl_want: "Mwen vle",
  nl_sending: "Ap voye…",
  nl_welcome_prefix: "Byenveni!",
  nl_check_mail: "Tcheke imel ou — nou voye kòd la. Li la a tou:",
  nl_copy: "kopye",
  nl_valid_note: "Valab pou premye acha ou. Pa ka konbine.",
  nl_err_subscribed: "Imel sa a deja enskri. Tcheke bwat ou.",
  nl_err_claimed: "Ou deja resevwa kòd byenveni ou sou aparèy sa a.",
  nl_err_email: "Antre yon imel valab.",
  nl_err_server: "Gen yon erè. Eseye ankò talè.",
  search_placeholder: "Chèche pwodui…",
  search_for: "pou",
  search_in: "nan",
  no_results: "Pa gen rezilta",
  no_results_sub: "Eseye yon lòt mo oswa retire filtè yo.",
  clear_filters: "Efase filtè yo",
  sort_label: "Triye",
  sort_recent: "Pi resan",
  sort_price_asc: "Pri pi ba",
  sort_price_desc: "Pri pi wo",
  sort_discount: "Pi gwo rabè",
  cat_label: "Kategori",
  all_f: "Tout",
  filter_btn: "Filtre",
  sale_active: "Rabè aktif",
  sale_count: "{n} pwodui ak rabè jiska -{m}%",
  sale_soon: "Rabè ap vini talè",
  stat_products: "Pwodui",
  stat_avg: "Rabè mwayèn",
  stat_upto: "Jiska",
  sale_empty_title: "Poko gen rabè",
  sale_empty_sub: "Tounen talè, gwo rabè ap vini.",
  view_catalog: "Wè tout katalòg la",
  co_contact: "Enfòmasyon kontak",
  co_name: "Non konplè",
  co_phone: "Telefòn",
  co_optional: "(opsyonèl)",
  co_shipping: "Adrès livrezon",
  co_street: "Ri ak nimewo",
  co_city: "Vil",
  co_state: "Pwovens",
  co_zip: "Kòd postal",
  co_country: "Peyi",
  co_summary: "Rezime kòmand lan",
  co_discount_code: "Kòd rabè",
  co_apply: "Aplike",
  co_discount: "Rabè",
  co_shipping_calc: "Ap kalkile",
  co_total: "Total",
  co_pay_paypal: "Peye ak PayPal →",
  co_processing: "Ap trete…",
  co_pay_wa: "Kòmande sou WhatsApp",
  co_wa_note: "Kòmand ou ap anrejistre epi WhatsApp ap ouvri ak rezime a pare pou voye.",
  co_or: "oswa",
  back_home: "Tounen lakay",
  co_err_code: "Kòd pa valab",
  co_err_code_used: "Kòd sa a deja itilize",
  co_err_validate: "Erè validasyon. Eseye ankò.",
  co_err_order: "Nou pa t ka trete kòmand lan",
  co_err_conn: "Erè koneksyon. Eseye ankò.",
  co_err_no_url: "Pa gen URL peman",
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
