import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { getActiveTheme } from "@/lib/data/theme-query";
import { getStorefrontTenantId } from "@/lib/tenant-context";
import { paletteToCssVars } from "@/lib/theme";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Título de plataforma por defecto. Las rutas de tienda (/store, /productos,
// /ofertas, /c, /p, /checkout) lo pisan con el nombre del tenant.
export const metadata: Metadata = {
  title: "BeautySale",
  description: "Lanzá tu tienda de belleza online sin código.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { palette } = await getActiveTheme(await getStorefrontTenantId());
  const themeVars = paletteToCssVars(palette);
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
      style={themeVars as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col bg-cream text-plum">
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
