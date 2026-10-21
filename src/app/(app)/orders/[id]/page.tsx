import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Detail Pesanan" description="Faktur transaksi penjualan." />
      <ComingSoon batch={5} />
    </>
  );
}