import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Pelanggan" description="Data pelanggan yang bertransaksi." />
      <ComingSoon batch={3} />
    </>
  );
}