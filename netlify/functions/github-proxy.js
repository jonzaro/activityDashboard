exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GitHub token not configured on server" }),
    };
  }

  // Extract the GitHub API path from the function URL path
  const functionPrefix = "/.netlify/functions/github-proxy";
  const apiPath = event.path.replace(functionPrefix, "");
  if (!apiPath) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing API path" }),
    };
  }

  // Reconstruct query string from parameters
  const queryString = event.rawQuery || "";
  const githubUrl = `https://api.github.com${apiPath}${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetch(githubUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
