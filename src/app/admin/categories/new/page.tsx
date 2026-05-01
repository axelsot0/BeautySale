import { CategoryForm } from "../CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">categorías</p>
        <h1 className="font-display text-4xl mt-1">Nueva categoría</h1>
      </header>
      <CategoryForm />
    </div>
  );
}
