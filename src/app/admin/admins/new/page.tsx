import { AdminForm } from "../AdminForm";

export default function NewAdminPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-pink">seguridad</p>
        <h1 className="font-display text-4xl mt-1">Nuevo admin</h1>
        <p className="text-plum-soft mt-1">El usuario podrá iniciar sesión inmediatamente.</p>
      </header>
      <AdminForm />
    </div>
  );
}
