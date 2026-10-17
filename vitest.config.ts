import { defineConfig } from "vitest/config";

// 純粋関数のテストだけなので、vite.config.ts の Cloudflare プラグインは読み込まない
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
