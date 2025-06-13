import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "global-polyfill",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            attrs: { type: "module" },
            children: `
              if (typeof window !== 'undefined') {
                window.global = window;
                window.process = window.process || { env: {} };
                window.Buffer = window.Buffer || require('buffer').Buffer;
                window.util = window.util || { inherits: function() {} };
              }
            `,
            injectTo: "head-prepend",
          },
        ];
      },
    },
  ],
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
