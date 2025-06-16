import { LinearTicket } from "../types";

export class LinearService {
  private token: string;
  private baseUrl = "/api/linear"; // Use the proxied URL instead

  constructor(token: string) {
    this.token = token;
  }

  private async request(query: string, variables?: any) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: this.token, // Remove the Bearer prefix
        "Content-Type": "application/json",
        // Keep these headers to prevent CSRF protection
        "x-apollo-operation-name": "GetTickets",
        "apollo-require-preflight": "true",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Linear API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(`Linear GraphQL error: ${result.errors[0].message}`);
    }

    return result.data;
  }

  async getTickets(limit = 50): Promise<LinearTicket[]> {
    const query = `
      query GetTickets($first: Int!) {
        viewer {
          assignedIssues(first: $first, orderBy: updatedAt) {
            nodes {
              id
              title
              url
              createdAt
              updatedAt
              description
              priority
              state {
                name
                type
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.request(query, { first: limit });

      return data.viewer.assignedIssues.nodes.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        status: this.mapStateToStatus(issue.state.type),
        date: issue.updatedAt,
        url: issue.url,
        description: issue.description,
        priority: issue.priority || "medium",
      }));
    } catch (error) {
      console.error("Error fetching Linear tickets:", error);
      return [];
    }
  }

  private mapStateToStatus(stateType: string): LinearTicket["status"] {
    switch (stateType) {
      case "backlog":
      case "unstarted":
        return "created";
      case "started":
        return "in_progress";
      case "completed":
        return "completed";
      case "canceled":
        return "closed";
      default:
        return "assigned";
    }
  }
}
