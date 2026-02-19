import { GitHubCommit, GitHubMerge } from "../types";

export class GitHubService {
  private proxyUrl = "/.netlify/functions/github-proxy";
  private username = "jonzaro";

  private async request(endpoint: string) {
    const url = `${this.proxyUrl}${endpoint}`;
    const response = await fetch(url);

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
        const perPage = Math.ceil(limit / repositories.length);
        const data = await this.request(
          `/repos/${repo}/commits?per_page=${perPage}&author=${this.username}`
        );

        const repoCommits: GitHubCommit[] = data.map((commit: any) => ({
          id: commit.sha,
          message: commit.commit.message.split("\n")[0],
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

  async getMergedPRs(
    repositories: string[],
    limit = 30
  ): Promise<GitHubMerge[]> {
    const merges: GitHubMerge[] = [];

    for (const repo of repositories) {
      try {
        const perPage = Math.ceil(limit / repositories.length);
        const data = await this.request(
          `/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=${perPage}`
        );

        const repoMerges: GitHubMerge[] = data
          .filter(
            (pr: any) =>
              pr.merged_at && pr.user?.login === this.username
          )
          .map((pr: any) => ({
            id: pr.id.toString(),
            title: pr.title,
            timestamp: pr.merged_at,
            repository: repo,
            url: pr.html_url,
            number: pr.number,
            author: {
              name: pr.user.login,
              avatar: pr.user.avatar_url,
            },
          }));

        merges.push(...repoMerges);
      } catch (error) {
        console.error(`Error fetching merged PRs for ${repo}:`, error);
      }
    }

    return merges.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
