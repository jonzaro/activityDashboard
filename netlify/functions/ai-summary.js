const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!githubToken || !anthropicKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing required environment variables" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { type, repository, identifier } = body;
  if (!type || !repository || !identifier) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing required fields: type, repository, identifier" }),
    };
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
          .map((f) => f.patch || "")
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
          .map((f) => f.patch || "")
          .filter(Boolean)
          .join("\n");
      }
    } else {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Invalid type. Must be 'commit' or 'pr'" }),
      };
    }

    // Handle empty diffs (merge commits, etc.)
    if (!diffText.trim()) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ summary: "Merge commit with no direct code changes. This commit integrates work from another branch." }),
      };
    }

    // Truncate to 8000 chars to stay within token limits
    const truncatedDiff = diffText.slice(0, 8000);

    // Call Claude Haiku 3.5
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
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
    });

    const claudeData = await claudeResponse.json();

    if (claudeData.error) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: claudeData.error.message }),
      };
    }

    const summary = claudeData.content?.[0]?.text || "Unable to generate summary.";

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ summary }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
