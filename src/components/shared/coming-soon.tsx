// Placeholder sementara untuk halaman yang dikerjakan di batch berikutnya.
export function ComingSoon({ batch }: { batch: number }) {
  return (
    <div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50">
      <span className="micro-label">Dalam pengerjaan</span>
      <p className="text-sm text-zinc-500">Halaman ini diimplementasikan pada batch {batch}.</p>
    </div>
  );
}
