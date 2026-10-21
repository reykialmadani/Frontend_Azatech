import { authRoutes } from "./auth";
import { productRoutes } from "./products";
import { createMockFetch } from "./router";

export const mockFetch = createMockFetch([...authRoutes, ...productRoutes]);
