import { GitHubCommit } from "../types";

export class GitHubService {
  private token: string;
  private baseUrl = "https://api.github.com";
  private username = "jonzaro"; // The GitHub username to filter by

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string) {
    // Check if token exists
    if (!this.token) {
      throw new Error("GitHub token is required");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`, // Changed to Bearer format for GitHub's newer tokens
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28", // Adding explicit API version
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async getCommits(
    repositories: string[],
    limit = 50
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];

    for (const repo of repositories) {
      try {
        // Fetch commits by the specific author
        const data = await this.request(
          `/repos/${repo}/commits?per_page=${Math.ceil(
            limit / repositories.length
          )}&author=${this.username}`
        );

        const repoCommits: GitHubCommit[] = data.map((commit: any) => ({
          id: commit.sha,
          message: commit.commit.message.split("\n")[0], // First line only
          timestamp: commit.commit.author.date,
          repository: repo,
          url: commit.html_url,
          author: {
            name: commit.commit.author.name,
            avatar: commit.author?.avatar_url,
          },
        }));

        commits.push(...repoCommits);
      } catch (error) {
        console.error(`Error fetching commits for ${repo}:`, error);
      }
    }

    return commits.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
