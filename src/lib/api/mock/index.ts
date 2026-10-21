import { authRoutes } from "./auth";
import { customerRoutes } from "./customers";
import { productRoutes } from "./products";
import { createMockFetch } from "./router";

export const mockFetch = createMockFetch([...authRoutes, ...productRoutes, ...customerRoutes]);
