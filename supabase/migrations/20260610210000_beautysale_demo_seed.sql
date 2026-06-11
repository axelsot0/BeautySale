-- Seed the BeautySale demo store (tenant_id = 1) with realistic content.
-- Safe to re-run: uses DELETE + INSERT so content is always fresh.
-- Does NOT touch the tenants row itself.

DO $$
DECLARE tid CONSTANT int := 1;
BEGIN

-- ── Limpiar contenido anterior ────────────────────────────────────────────
DELETE FROM public.news                  WHERE tenant_id = tid;
DELETE FROM public.brands                WHERE tenant_id = tid;
DELETE FROM public.flash_sale            WHERE tenant_id = tid;
DELETE FROM public.banners               WHERE tenant_id = tid;
DELETE FROM public.products              WHERE tenant_id = tid;
DELETE FROM public.categories            WHERE tenant_id = tid;
DELETE FROM public.sections              WHERE tenant_id = tid;

-- ── Actualizar tienda ─────────────────────────────────────────────────────
UPDATE public.tenants SET
  site_name           = 'Beauty Sale',
  demo_mode           = false,
  newsletter_title    = 'Unite a nuestro club',
  newsletter_subtitle = 'Obtené 10% OFF en tu primera compra más acceso exclusivo a lanzamientos y ofertas.',
  newsletter_discount_pct = 10
WHERE id = tid;

-- ── Ticker de noticias ────────────────────────────────────────────────────
INSERT INTO public.news (tenant_id, text, active, position) VALUES
  (tid, 'Envío gratis en compras superiores a $50',        true, 0),
  (tid, '10% de descuento en tu primera compra',           true, 1),
  (tid, 'Hasta 12 cuotas sin interés con tarjeta',         true, 2),
  (tid, 'Regalo sorpresa en pedidos mayores a $100',       true, 3),
  (tid, 'Suscribite al newsletter y recibí código de descuento', true, 4);

-- ── Categorías ────────────────────────────────────────────────────────────
INSERT INTO public.categories (id, tenant_id, name, slug, color, icon, position) VALUES
  ('cat-skincare', tid, 'Skincare',          'skincare',          '#7DD3C0', '✨', 0),
  ('cat-labios',   tid, 'Labios',            'labios',            '#FF4D8B', '💋', 1),
  ('cat-ojos',     tid, 'Ojos',              'ojos',              '#B5A3E8', '👁',  2),
  ('cat-rostro',   tid, 'Rostro',            'rostro',            '#FFE066', '🌟', 3),
  ('cat-cabello',  tid, 'Cabello',           'cabello',           '#E5DEFF', '💁', 4),
  ('cat-cuerpo',   tid, 'Cuidado corporal',  'cuidado-corporal',  '#CFEFE6', '🧴', 5);

-- ── Productos ─────────────────────────────────────────────────────────────
-- Skincare
INSERT INTO public.products (tenant_id, title, slug, description, price, discount_percent, stock, category_id, featured, on_sale, images) VALUES
(tid,'Sérum vitamina C glow 30 ml','serum-vitamina-c-glow',
 'Sérum de alta concentración con vitamina C estabilizada al 15%, niacinamida y ácido hialurónico. Unifica el tono, ilumina y reduce manchas visibles en 4 semanas. Fórmula ligera, apta para todo tipo de piel.',
 24.99,20,40,'cat-skincare',true,true,
 ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
       'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80']),

(tid,'Crema hidratante 24h con ácido hialurónico','crema-hidratante-24h',
 'Crema de textura ligera con ácido hialurónico de triple peso molecular. Hidratación intensa hasta 24 horas, efecto plumping y barrera cutánea fortalecida. Sin parabenos, sin fragancia.',
 19.50,0,55,'cat-skincare',true,false,
 ARRAY['https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600&q=80']),

(tid,'Mascarilla detox arcilla negra','mascarilla-detox-arcilla-negra',
 'Mascarilla de uso semanal con arcilla negra volcánica, carbón activado y extracto de árbol de té. Limpia profundo, reduce poros y controla el exceso de sebo sin resecar.',
 14.20,0,30,'cat-skincare',true,false,
 ARRAY['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80']),

(tid,'Protector solar SPF 50+ tono uniforme','protector-solar-spf50',
 'Protector solar de amplio espectro SPF 50+ con acabado mate y tono unificador leve. Textura no grasosa, apto para uso diario bajo maquillaje. Resistente al agua.',
 18.00,15,45,'cat-skincare',false,true,
 ARRAY['https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80']),

(tid,'Sérum retinol anti-edad 0.5%','serum-retinol-anti-edad',
 'Sérum con retinol encapsulado al 0.5%, péptidos de cobre y vitamina E. Minimiza líneas finas, mejora la textura y aporta firmeza progresiva. Uso nocturno recomendado.',
 32.00,0,25,'cat-skincare',false,false,
 ARRAY['https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600&q=80']),

-- Labios
(tid,'Labial mate cherry pop','labial-mate-cherry-pop',
 'Labial líquido de fórmula ultramatte. Pigmento intenso en tono cereza vibrante, transferencia mínima y larga duración hasta 8 horas. No reseca, con vitamina E.',
 12.00,30,60,'cat-labios',true,true,
 ARRAY['https://images.unsplash.com/photo-1631214503851-25e91e56c8e0?w=600&q=80',
       'https://images.unsplash.com/photo-1586495985010-c4e2772b8a30?w=600&q=80']),

(tid,'Bálsamo labial hidratante miel','balsamo-labial-miel',
 'Bálsamo labial nutritivo con manteca de karité, aceite de coco y extracto de miel. Repara labios secos, aporta brillo natural y protección UV ligera. Fragancia suave.',
 6.50,0,80,'cat-labios',true,false,
 ARRAY['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80']),

(tid,'Gloss voluminizador nude rose','gloss-voluminizador-nude',
 'Gloss con efecto voluminizador gracias al extracto de jengibre. Tono nude rosado universal que ilumina y da apariencia de labios más carnosos. Acabado brillante no pegajoso.',
 10.90,0,50,'cat-labios',false,false,
 ARRAY['https://images.unsplash.com/photo-1586495985010-c4e2772b8a30?w=600&q=80']),

-- Ojos
(tid,'Paleta sombras sunset 12 tonos','paleta-sombras-sunset',
 'Paleta de 12 sombras con acabados matte, shimmer y glitter. Tonos cálidos del terracota al dorado, altamente pigmentados y de larga duración. Incluye espejo y aplicador doble.',
 29.90,0,35,'cat-ojos',true,false,
 ARRAY['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80',
       'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=600&q=80']),

(tid,'Máscara de pestañas volumen extremo','mascara-volumen-extremo',
 'Máscara de pestañas con cepillo cónico y fórmula de polímeros enriquecida. Da volumen y longitud en una sola pasada, efecto "pestañas postizas" sin grumos. Resistente al agua.',
 13.20,0,55,'cat-ojos',true,false,
 ARRAY['https://images.unsplash.com/photo-1631214524020-3c69d03c6a87?w=600&q=80']),

(tid,'Delineador líquido negrofino','delineador-liquido-negro',
 'Delineador líquido de punta ultra fina (0.1 mm). Tinta de secado rápido, intensamente negro, resistente al agua y al frotamiento. Ideal para líneas precisas y cat eye.',
 9.90,15,65,'cat-ojos',true,true,
 ARRAY['https://images.unsplash.com/photo-1631214524020-3c69d03c6a87?w=600&q=80']),

-- Rostro
(tid,'Base fluida cobertura natural SPF 20','base-fluida-cobertura-natural',
 'Base de cobertura media a completa con acabado piel desnuda. Formulada con SPF 20, extractos de aloe vera y pigmentos de alta definición. 10 tonos disponibles, larga duración 16h.',
 27.00,0,40,'cat-rostro',true,false,
 ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80']),

(tid,'Iluminador en polvo aurora rosada','iluminador-aurora-rosada',
 'Iluminador en polvo compacto con pigmentos perlados en tono rosa champagne. Reflejo dimensional, larga duración y mezcla perfecta. Apto para todas las pieles.',
 16.50,0,45,'cat-rostro',false,false,
 ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80']),

-- Cabello
(tid,'Aceite de argán nutritivo 100 ml','aceite-argan-nutritivo',
 'Aceite de argán marroquí 100% puro, prensado en frío. Nutre en profundidad, aporta brillo espejo y controla el frizz sin pesar el cabello. Uso en seco o húmedo.',
 21.00,0,30,'cat-cabello',false,false,
 ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80']),

(tid,'Mascarilla capilar reconstrucción','mascarilla-capilar-reconstruccion',
 'Mascarilla de uso semanal con proteína de seda, queratina y manteca de mango. Reconstruye la fibra capilar dañada, elimina la porosidad y aporta suavidad duradera.',
 17.50,20,35,'cat-cabello',false,true,
 ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80']),

-- Cuerpo
(tid,'Crema corporal manteca de karité','crema-corporal-karite',
 'Crema corporal de textura rica con manteca de karité etíope, aceite de almendras dulces y vitamina E. Hidratación profunda de 48 horas, fragancia vainilla bourbon suave.',
 16.00,0,50,'cat-cuerpo',true,false,
 ARRAY['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80']),

(tid,'Exfoliante corporal azúcar y mango','exfoliante-azucar-mango',
 'Exfoliante azucarado con aceite de mango y extracto de papaya. Elimina células muertas, suaviza e hidrata en un solo paso. Aroma tropical fresco, sin sulfatos.',
 13.00,25,40,'cat-cuerpo',false,true,
 ARRAY['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80']),

(tid,'Body mist rosas y almendras 200 ml','body-mist-rosas-almendras',
 'Agua perfumada corporal con notas de rosas frescas, almendras dulces y fondo de sándalo. Larga duración 4-6 horas. Libre de alcohol, no reseca. Ideal para uso diario.',
 11.50,0,60,'cat-cuerpo',false,false,
 ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80']);

-- ── Hero banner ───────────────────────────────────────────────────────────
INSERT INTO public.banners (tenant_id, title, subtitle, cta_label, link, image_url,
  eyebrow_text, eyebrow_color, cta2_label, cta2_link, marquee_text,
  slot, position, active)
VALUES (
  tid,
  'Tu rutina de belleza, reinventada',
  'Skincare, maquillaje y cuidado corporal con ingredientes que realmente funcionan.',
  'Comprar ahora',
  '/productos',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&q=85',
  'Nueva colección',
  '#FFE066',
  'Ver categorías',
  '/productos',
  'NUEVO',
  'hero',
  0,
  true
);

-- Banners de mosaico editorial
INSERT INTO public.banners (tenant_id, title, subtitle, cta_label, link, image_url,
  eyebrow_text, eyebrow_color, cta2_label, cta2_link, marquee_text,
  slot, position, active)
VALUES
(tid,'Rituales de cuidado nocturno','La piel se regenera mientras dormís. Descubrí nuestra rutina de noche.',
 null,'/c/skincare',
 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
 null,null,null,null,null,'mosaic',0,true),
(tid,'Labios que hablan por vos','Tonos que duran todo el día, desde el brunch hasta la noche.',
 null,'/c/labios',
 'https://images.unsplash.com/photo-1631214503851-25e91e56c8e0?w=800&q=80',
 null,null,null,null,null,'mosaic',1,true),
(tid,'Mirada poderosa','Paletas, máscaras y delineadores para cada look.',
 null,'/c/ojos',
 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=800&q=80',
 null,null,null,null,null,'mosaic',2,true);

-- ── Marcas ────────────────────────────────────────────────────────────────
INSERT INTO public.brands (tenant_id, name, logo_url, font_style, position, active) VALUES
  (tid, 'Lumière',    null, 'serif-italic',       0, true),
  (tid, 'GLOSSY',     null, 'display-bold',       1, true),
  (tid, 'petal & co', null, 'sans-wide',          2, true),
  (tid, 'Aurora',     null, 'display-italic',     3, true),
  (tid, 'BLOOM',      null, 'sans-black',         4, true),
  (tid, 'Sunkissed',  null, 'display-semibold',   5, true),
  (tid, 'MIRA',       null, 'sans-thin',          6, true),
  (tid, 'Rosé Lab',   null, 'display-bold-italic',7, true);

-- ── Flash Sale ────────────────────────────────────────────────────────────
INSERT INTO public.flash_sale (tenant_id, active, title, discount_label, description, cta_link, ends_at)
VALUES (
  tid, true,
  'Flash Sale — Solo hoy',
  '-30% OFF',
  'En toda la línea de skincare y labiales seleccionados. Descuento aplicado automáticamente. Sin código necesario.',
  '/ofertas',
  NULL
);

-- ── Secciones del home ────────────────────────────────────────────────────
INSERT INTO public.sections (tenant_id, type, position, active, config) VALUES
  (tid, 'banner',          0, true,  '{"title":"Cuídate hoy","subtitle":"Rituales que marcan la diferencia","image_url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80","cta_label":"Ver productos","cta_link":"/productos","bg_color":"#FF4D8B"}'::jsonb),
  (tid, 'product_carousel',1, true,  '{"source":"featured","eyebrow":"Lo más querido","title":"Bestsellers"}'::jsonb),
  (tid, 'mosaic',          2, true,  '{"eyebrow":"Editoriales","title":"Inspiración para tu rutina"}'::jsonb),
  (tid, 'flash_sale',      3, true,  '{}'::jsonb),
  (tid, 'brand_strip',     4, true,  '{}'::jsonb),
  (tid, 'newsletter',      5, true,  '{}'::jsonb);

END $$;
