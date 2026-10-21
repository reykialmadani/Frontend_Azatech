// Data dummy in-memory untuk mode mock. Hilang saat halaman di-reload penuh.
import type { User } from "@/types/auth";

export const MOCK_CREDENTIALS = {
  email: "admin@azatech.id",
  password: "password",
};

export const mockUser: User = {
  id: "8c1f3a52-0d6e-4b7a-9a51-3f2c1d7e9b10",
  name: "Admin AZA",
  email: MOCK_CREDENTIALS.email,
};
