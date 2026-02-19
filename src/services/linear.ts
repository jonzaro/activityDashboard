import { LinearTicket } from "../types";

export class LinearService {
  private token: string;
  // Use Netlify function in production
  private baseUrl = import.meta.env.PROD
    ? "/.netlify/functions/linear-proxy"
    : "/api/linear";

  constructor(token: string) {
    this.token = token;
  }

  private async request(query: string, variables?: any) {
    // Don't send headers if using the proxy in production, as the proxy will use environment variables
    const headers = import.meta.env.PROD
      ? { "Content-Type": "application/json" }
      : {
          Authorization: this.token, // Send token for dev environment
          "Content-Type": "application/json",
        };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Linear API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("Linear GraphQL errors:", result.errors);
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

      if (!data?.viewer?.assignedIssues?.nodes) {
        console.warn("No Linear issues found in response");
        return [];
      }

      const tickets = data.viewer.assignedIssues.nodes.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        status: this.mapStateToStatus(issue.state.type),
        date: issue.updatedAt,
        url: issue.url,
        description: issue.description,
        priority: this.mapPriorityToTicketPriority(issue.priority),
      }));

      return tickets;
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

  private mapPriorityToTicketPriority(
    priority: number | null
  ): LinearTicket["priority"] {
    if (priority === null || priority === undefined) return "medium";

    switch (priority) {
      case 0:
        return "low";
      case 1:
        return "medium";
      case 2:
        return "high";
      case 3:
      case 4:
        return "urgent";
      default:
        return "medium";
    }
  }
}
