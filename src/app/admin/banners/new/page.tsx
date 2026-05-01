import { BannerForm } from "../BannerForm";

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">visual</p>
        <h1 className="font-display text-4xl mt-1">Nuevo banner</h1>
      </header>
      <BannerForm />
    </div>
  );
}
