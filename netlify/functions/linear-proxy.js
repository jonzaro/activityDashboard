exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Use the token from environment variables if no Authorization header
    const authHeader =
      event.headers.authorization || process.env.VITE_LINEAR_TOKEN;

    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: event.body,
    });

    const data = await response.json();

    return {
      statusCode: response.status || 200,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Add CORS headers
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
