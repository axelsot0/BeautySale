import { NewsForm } from "../NewsForm";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">news</p>
        <h1 className="font-display text-4xl mt-1">Nuevo mensaje</h1>
      </header>
      <NewsForm />
    </div>
  );
}
