import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import brand from "./src/brand.json" with { type: "json" };

export default defineConfig({
  plugins: [
    react(),
    {
      name: "brand-title",
      transformIndexHtml: (html, context) => {
        const branded = html.replaceAll("%BRAND_NAME%", brand.name);
        if (context.server) {
          // Installation assets exist only in production; avoid development 404s.
          return branded.replace(
            /\s*<link rel="(?:manifest|apple-touch-icon)"[^>]*>/g,
            "",
          );
        }
        return branded;
      },
    },
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
