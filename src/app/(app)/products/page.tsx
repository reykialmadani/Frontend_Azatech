import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Katalog Produk" description="Kelola inventaris, harga, dan stok produk." />
      <ComingSoon batch={2} />
    </>
  );
}