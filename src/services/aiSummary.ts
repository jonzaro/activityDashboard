export class AISummaryService {
  private proxyUrl = "/.netlify/functions/ai-summary";

  private cacheKey(
    type: "commit" | "pr",
    repository: string,
    identifier: string
  ): string {
    return `ai-summary-${repository}-${type}-${identifier}`;
  }

  getCached(
    type: "commit" | "pr",
    repository: string,
    identifier: string
  ): string | null {
    const key = this.cacheKey(type, repository, identifier);
    return localStorage.getItem(key);
  }

  async getSummary(
    type: "commit" | "pr",
    repository: string,
    identifier: string
  ): Promise<string | null> {
    const key = this.cacheKey(type, repository, identifier);

    // Check cache first
    const cached = localStorage.getItem(key);
    if (cached) return cached;

    try {
      const response = await fetch(this.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, repository, identifier }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.summary) {
        localStorage.setItem(key, data.summary);
        return data.summary;
      }

      return null;
    } catch {
      return null;
    }
  }
}
