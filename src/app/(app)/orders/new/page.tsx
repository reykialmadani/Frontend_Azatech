import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Pesanan Baru" description="Buat transaksi penjualan baru." />
      <ComingSoon batch={4} />
    </>
  );
}