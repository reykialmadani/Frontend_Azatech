import { authRoutes } from "./auth";
import { createMockFetch } from "./router";

export const mockFetch = createMockFetch([...authRoutes]);
