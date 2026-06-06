import { BannerForm } from "../BannerForm";

function Tabs() {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-plum/5 w-fit">
      <a
        href="/admin/banners/hero"
        className="rounded-xl px-5 py-2 text-sm font-semibold text-plum/60 hover:text-plum transition"
      >
        Hero
      </a>
      <a
        href="/admin/banners"
        className="rounded-xl px-5 py-2 text-sm font-semibold bg-white shadow text-plum transition"
      >
        Banners
      </a>
    </div>
  );
}

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
        <h1 className="font-display text-4xl mt-1">Nuevo banner</h1>
      </header>
      <Tabs />
      <BannerForm />
    </div>
  );
}
