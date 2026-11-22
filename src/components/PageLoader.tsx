interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "กำลังโหลดข้อมูล..." }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full min-h-[calc(100vh-4rem)] bg-black flex flex-col items-center justify-center gap-4 px-6"
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="h-12 w-12 rounded-full border-[3px] border-zinc-800 border-t-emerald-400 animate-spin shadow-[0_0_24px_rgba(16,185,129,0.25)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-2 w-2 rounded-full bg-emerald-400/80 animate-pulse"
        />
      </div>
      <p className="text-sm text-zinc-400 tracking-wide">{label}</p>
    </div>
  );
}
