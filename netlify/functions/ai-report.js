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

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing ANTHROPIC_API_KEY environment variable" }),
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

  const { type, activities, teamRoster } = body;
  if (!type || !activities) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing required fields: type, activities" }),
    };
  }

  if (type !== "standup" && type !== "rollup") {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid type. Must be 'standup' or 'rollup'" }),
    };
  }

  try {
    // Truncate activities data to stay within token limits
    const activitiesJson = JSON.stringify(activities).slice(0, 12000);
    const rosterLine = teamRoster ? `Team members: ${teamRoster.join(", ")}` : "";

    const prompt =
      type === "standup"
        ? `You are generating a Daily Standup report for a software development team.
${rosterLine}

Each activity has an "employee" field with the team member's name. Group activities by employee name.

Format the report as:
- A brief 1-sentence team overview
- Then for each team member who has activity, a section with their name as a ## heading, listing what they worked on (based on commit messages, PR titles, and ticket titles in the data). If a member has no activities, note "No recent activity" under their name.
- End with a brief "Team Focus" note

Use business-friendly language with light technical context. Keep it concise — this is for a quick team sync.

Activities data:
${activitiesJson}`
        : `You are generating a Weekly Rollup report for a software development team.
${rosterLine}

Each activity has an "employee" field with the team member's name. Group activities by employee name.

Format the report as:
- A 2-3 sentence executive summary of the week's accomplishments
- Then for each team member, a section with their name as a ## heading, summarizing their key contributions. If a member has no activities, note "No recent activity" under their name.
- A "Key Highlights" section with 3-5 bullet points of the most impactful work
- End with a brief "Looking Ahead" note

Use business-friendly language with light technical context. This is for stakeholders and team leads.

Activities data:
${activitiesJson}`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
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

    const content = claudeData.content?.[0]?.text || "Unable to generate report.";

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ content, generatedAt: new Date().toISOString(), type }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
