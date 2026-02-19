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
      {
        name: "ai-summary-dev",
        configureServer(server) {
          server.middlewares.use(
            "/.netlify/functions/ai-summary",
            async (req, res) => {
              if (req.method !== "POST") {
                res.statusCode = 405;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Method Not Allowed" }));
                return;
              }

              const githubToken = env.GITHUB_TOKEN;
              const anthropicKey = env.ANTHROPIC_API_KEY;

              if (!githubToken || !anthropicKey) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "GITHUB_TOKEN or ANTHROPIC_API_KEY not set in .env",
                  })
                );
                return;
              }

              // Read POST body
              let body = "";
              for await (const chunk of req) {
                body += chunk;
              }

              let parsed;
              try {
                parsed = JSON.parse(body);
              } catch {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid JSON body" }));
                return;
              }

              const { type, repository, identifier } = parsed;
              if (!type || !repository || !identifier) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error:
                      "Missing required fields: type, repository, identifier",
                  })
                );
                return;
              }

              try {
                // Fetch diff from GitHub
                let diffText = "";

                if (type === "commit") {
                  const response = await fetch(
                    `https://api.github.com/repos/${repository}/commits/${identifier}`,
                    {
                      headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                      },
                    }
                  );
                  const data = await response.json();
                  if (data.files) {
                    diffText = data.files
                      .map((f: any) => f.patch || "")
                      .filter(Boolean)
                      .join("\n");
                  }
                } else if (type === "pr") {
                  const response = await fetch(
                    `https://api.github.com/repos/${repository}/pulls/${identifier}/files`,
                    {
                      headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                      },
                    }
                  );
                  const data = await response.json();
                  if (Array.isArray(data)) {
                    diffText = data
                      .map((f: any) => f.patch || "")
                      .filter(Boolean)
                      .join("\n");
                  }
                }

                // Handle empty diffs
                if (!diffText.trim()) {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      summary:
                        "Merge commit with no direct code changes. This commit integrates work from another branch.",
                    })
                  );
                  return;
                }

                const truncatedDiff = diffText.slice(0, 8000);

                // Call Claude Haiku 3.5
                const claudeResponse = await fetch(
                  "https://api.anthropic.com/v1/messages",
                  {
                    method: "POST",
                    headers: {
                      "x-api-key": anthropicKey,
                      "anthropic-version": "2023-06-01",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "claude-haiku-4-5-20251001",
                      max_tokens: 150,
                      messages: [
                        {
                          role: "user",
                          content: `Summarize this code diff in exactly 2 sentences. First sentence: describe the technical change (specific files, functions, or components affected). Second sentence: explain the positive business or app impact of this change. Be concise and confident.\n\n${truncatedDiff}`,
                        },
                      ],
                    }),
                  }
                );

                const claudeData = await claudeResponse.json();

                if (claudeData.error) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({ error: claudeData.error.message })
                  );
                  return;
                }

                const summary =
                  claudeData.content?.[0]?.text ||
                  "Unable to generate summary.";

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ summary }));
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
