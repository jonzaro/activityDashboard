import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer",
      util: "util",
    },
  },
  server: {
    proxy: {
      "/api/linear": {
        target: "https://api.linear.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/linear/, "/graphql"),
        secure: false,
      },
    },
  },
});
