import { BrandForm } from "../BrandForm";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">marcas</p>
        <h1 className="font-display text-4xl mt-1">Nueva marca</h1>
      </header>
      <BrandForm />
    </div>
  );
}
