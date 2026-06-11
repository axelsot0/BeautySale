// Fixed, scroll-independent DEMO badge shown on a demo store's storefront.
export function DemoWatermark() {
  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-none select-none">
      <div className="flex items-center gap-2 rounded-full bg-plum/90 text-cream px-4 py-2 shadow-[0_8px_24px_rgba(45,27,78,0.25)] backdrop-blur">
        <span className="inline-block h-2 w-2 rounded-full bg-butter animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Demo</span>
      </div>
    </div>
  );
}
