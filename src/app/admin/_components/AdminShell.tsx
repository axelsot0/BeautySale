"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Image as ImageIcon,
  Megaphone,
  Shield,
  ShoppingBag,
  Palette,
  Zap,
  Sparkles,
  CreditCard,
  Code2,
  Layers,
  LogOut,
  Menu,
  X,
  Lock,
  Sparkle,
} from "lucide-react";
import { logout } from "../login/actions";
import { switchTenant } from "./tenant-switch";
import { cn } from "@/lib/utils";
import { isPathLockedInDemo } from "@/lib/demo";

type TenantOption = { id: number; name: string };

const NAV = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
  { label: "Pedidos",    href: "/admin/orders",     icon: ShoppingBag },
  { label: "Productos",  href: "/admin/products",   icon: Package },
  { label: "Categorías", href: "/admin/categories", icon: Tag },
  { label: "Banners",    href: "/admin/banners",    icon: ImageIcon },
  { label: "Diseño",     href: "/admin/sections",   icon: Layers },
  { label: "News",       href: "/admin/news",       icon: Megaphone },
  { label: "Flash Sale", href: "/admin/flash-sale", icon: Zap },
  { label: "Marcas",     href: "/admin/brands",     icon: Sparkles },
  { label: "Tema",       href: "/admin/theme",      icon: Palette },
  { label: "Ajustes",    href: "/admin/settings",   icon: CreditCard },
  { label: "Admins",     href: "/admin/admins",     icon: Shield },
];

export function AdminShell({
  userEmail,
  isDeveloper = false,
  tenants = [],
  currentTenantId = 0,
  isDemo = false,
  demoDaysLeft = null,
  children,
}: {
  userEmail: string;
  isDeveloper?: boolean;
  tenants?: TenantOption[];
  currentTenantId?: number;
  isDemo?: boolean;
  demoDaysLeft?: number | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const locked = isDemo && isPathLockedInDemo(pathname);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream">
      <header className="md:hidden flex items-center justify-between p-4 border-b border-plum/10 bg-cream sticky top-0 z-30">
        <a href="/admin" className="font-display text-2xl">
          Beauty<span className="text-pink italic">Sale</span>
          <span className="text-xs ml-2 rounded-full bg-plum text-cream px-2 py-0.5 align-middle">
            admin
          </span>
        </a>
        <button
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-plum/5"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <Sidebar
        pathname={pathname}
        userEmail={userEmail}
        isDeveloper={isDeveloper}
        tenants={tenants}
        currentTenantId={currentTenantId}
        isDemo={isDemo}
        demoDaysLeft={demoDaysLeft}
        className="hidden md:flex"
      />

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-plum/40" onClick={() => setOpen(false)} />
          <Sidebar
            pathname={pathname}
            userEmail={userEmail}
            isDeveloper={isDeveloper}
            tenants={tenants}
            currentTenantId={currentTenantId}
            isDemo={isDemo}
            demoDaysLeft={demoDaysLeft}
            className="absolute left-0 top-0 bottom-0 w-72"
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      <main className="flex-1 min-w-0 p-4 md:p-8 max-w-full">
        {locked ? <LockedFeature /> : children}
      </main>
    </div>
  );
}

function LockedFeature() {
  return (
    <div className="max-w-lg mx-auto mt-10 rounded-[28px] bg-white border border-plum/10 p-10 text-center space-y-4">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pink/10">
        <Lock className="h-7 w-7 text-pink" />
      </div>
      <h1 className="font-display text-3xl">Función premium</h1>
      <p className="text-plum-soft">
        Esta sección está disponible cuando activás tu tienda. En modo demo podés cargar
        productos, categorías, tu hero y recibir pedidos.
      </p>
      <div className="rounded-2xl bg-butter/30 px-4 py-3 text-sm text-plum">
        Escribinos para activar tu tienda y desbloquear tema, pagos, flash sales y más.
      </div>
      <a
        href="/admin"
        className="inline-flex items-center justify-center rounded-full bg-plum text-cream px-6 py-2.5 text-sm font-semibold hover:bg-pink transition"
      >
        Volver al panel
      </a>
    </div>
  );
}

function Sidebar({
  pathname,
  userEmail,
  isDeveloper,
  tenants = [],
  currentTenantId = 0,
  isDemo = false,
  demoDaysLeft = null,
  className,
  onClose,
}: {
  pathname: string;
  userEmail: string;
  isDeveloper?: boolean;
  tenants?: TenantOption[];
  currentTenantId?: number;
  isDemo?: boolean;
  demoDaysLeft?: number | null;
  className?: string;
  onClose?: () => void;
}) {
  // In demo mode, hide premium sections from the nav entirely.
  const navItems = isDemo ? NAV.filter((n) => !isPathLockedInDemo(n.href)) : NAV;
  return (
    <aside
      className={cn(
        "w-72 shrink-0 bg-plum text-cream flex flex-col p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <a href="/admin" className="font-display text-2xl">
          Beauty<span className="text-pink italic">Sale</span>
        </a>
        {onClose && (
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <span className="inline-block w-fit rounded-full bg-cream/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-4">
        Panel admin
      </span>

      {isDemo && (
        <div className="mb-4 rounded-2xl bg-butter/20 border border-butter/30 px-4 py-3 space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-butter">
            <Sparkle className="h-3.5 w-3.5" /> Modo demo
          </p>
          <p className="text-xs text-cream/70 leading-snug">
            {demoDaysLeft != null
              ? `Expira en ${demoDaysLeft} ${demoDaysLeft === 1 ? "día" : "días"}. Activá tu tienda para no perderla.`
              : "Activá tu tienda para desbloquear todas las funciones."}
          </p>
        </div>
      )}

      {isDeveloper && tenants.length > 0 && (
        <form action={switchTenant} className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-cream/50 mb-1">
            Viendo tienda
          </label>
          <select
            key={currentTenantId}
            name="tenant_id"
            defaultValue={currentTenantId}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="w-full rounded-xl bg-cream/10 border border-cream/15 px-3 py-2 text-sm text-cream outline-none focus:border-pink"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} className="text-plum">
                {t.name}
              </option>
            ))}
          </select>
        </form>
      )}

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <a
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-pink text-cream"
                  : "text-cream/80 hover:bg-cream/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          );
        })}

        {isDeveloper && (
          <a
            href="/dev"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition mt-2 bg-cream/10 text-butter hover:bg-cream/20"
          >
            <Code2 className="h-4 w-4" />
            Developer
          </a>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-cream/10 space-y-3">
        <div className="text-xs text-cream/60">
          <p className="font-semibold">Conectado como</p>
          <p className="truncate">{userEmail}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cream/10 px-4 py-2.5 text-sm font-semibold hover:bg-pink hover:text-cream transition"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
