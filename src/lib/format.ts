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

// "Admin AZA" -> "AA", "Budi" -> "BU"
export const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1
      ? `${words[0]![0]}${words[1]![0]}`
      : (words[0] ?? "").slice(0, 2);
  return initials.toUpperCase();
};

export const formatTanggalWaktu =(d: string | Date) =>
  format(new Date(d), "d MMMM yyyy, HH.mm", { locale: id });
