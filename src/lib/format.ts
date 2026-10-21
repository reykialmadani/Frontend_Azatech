import { format } from "date-fns";
import { id } from "date-fns/locale";

// Nilai uang dari backend berupa string desimal; Number() hanya untuk tampilan.
export const formatRupiah = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(Number(v))
    .replace(/ /g, " "); // "Rp 12.000"

export const formatTanggal = (d: string | Date) =>
  format(new Date(d), "d MMM yyyy", { locale: id });

export const formatTanggalWaktu = (d: string | Date) =>
  format(new Date(d), "d MMMM yyyy, HH.mm", { locale: id });
