import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan performa toko hari ini." />
      <ComingSoon batch={6} />
    </>
  );
}