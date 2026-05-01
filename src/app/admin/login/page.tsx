import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin · BeautySale" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cream via-pink-soft/30 to-lavender-soft">
      <div className="relative w-full max-w-md rounded-[28px] bg-cream/90 backdrop-blur p-8 shadow-[0_24px_60px_rgba(45,27,78,0.12)] border border-plum/5">
        <div className="text-center mb-8">
          <span className="font-display text-3xl">
            Beauty<span className="text-pink italic">Sale</span>
          </span>
          <p className="text-sm text-plum-soft mt-2">Panel admin</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
