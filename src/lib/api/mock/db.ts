// Data dummy in-memory untuk mode mock. Hilang saat halaman di-reload penuh.
import type { User } from "@/types/auth";
import type { Product } from "@/types/product";

export const MOCK_CREDENTIALS = {
  email: "admin@azatech.id",
  password: "password",
};

export const mockUser: User = {
  id: "8c1f3a52-0d6e-4b7a-9a51-3f2c1d7e9b10",
  name: "Admin AZA",
  email: MOCK_CREDENTIALS.email,
};

export const nowIso = () => new Date().toISOString();

// [nama, harga, stok, punya gambar?]
const PRODUCT_SEED: [string, number, number, boolean][] = [
  ["Hydrococo 150ml", 12000, 10, true],
  ["Teh Botol Sosro 250ml", 8000, 3, true],
  ["Aqua 600ml", 5000, 48, true],
  ["Pocari Sweat 500ml", 9500, 22, false],
  ["Indomie Goreng", 3500, 120, true],
  ["Chitato Sapi Panggang 68g", 11500, 4, false],
  ["Good Day Cappuccino 250ml", 7000, 0, true],
  ["Ultra Milk Coklat 250ml", 6500, 35, false],
  ["Silverqueen Almond 62g", 17500, 2, true],
  ["Oreo Vanilla 133g", 9000, 16, false],
  ["Teh Pucuk Harum 350ml", 4000, 60, true],
  ["Fruit Tea Blackcurrant 500ml", 6000, 1, false],
  ["Coca-Cola 390ml", 7500, 28, true],
  ["Sprite 390ml", 7500, 12, false],
  ["Kopi Kapal Api Special Mix", 2000, 85, false],
  ["Roti Sari Roti Coklat", 6000, 7, true],
  ["Beng-Beng 20g", 2500, 70, false],
  ["Qtela Singkong Balado 185g", 14000, 9, false],
  ["Yakult 5x65ml", 11000, 0, true],
  ["Le Minerale 600ml", 4500, 54, false],
  ["Nescafe Original Can 240ml", 9000, 13, true],
  ["Taro Net Seaweed 65g", 8500, 3, false],
  ["Mizone Lychee Lemon 500ml", 6500, 19, false],
  ["Cimory Yogurt Strawberry 250ml", 13500, 6, true],
];

export const products: (Product & { deleted_at: string | null })[] = PRODUCT_SEED.map(
  ([name, price, stock, hasImage], i) => {
    const code = `P${String(i + 1).padStart(4, "0")}`;
    const created = new Date(Date.now() - (60 - i) * 86_400_000).toISOString();
    return {
      id: i + 1,
      product_code: code,
      product_name: name,
      image_url: hasImage ? `https://picsum.photos/seed/${code}/96` : null,
      stock,
      price: price.toFixed(2),
      created_at: created,
      updated_at: created,
      deleted_at: null,
    };
  },
);
