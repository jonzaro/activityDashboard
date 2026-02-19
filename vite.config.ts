import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "github-proxy-dev",
        configureServer(server) {
          server.middlewares.use(
            "/.netlify/functions/github-proxy",
            async (req, res) => {
              const token = env.GITHUB_TOKEN;

              if (!token) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "GITHUB_TOKEN not set in .env",
                  })
                );
                return;
              }

              // req.url is the portion after the middleware mount path
              // e.g. "/repos/owner/repo/commits?per_page=10"
              const githubUrl = `https://api.github.com${req.url}`;

              try {
                const response = await fetch(githubUrl, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                  },
                });

                const data = await response.json();
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              } catch (error: any) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: error.message }));
              }
            }
          );
        },
      },
    ],
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
  };
});
