import { prisma } from "./db";
import { fetchSerp, findRanking, BrightDataError } from "./brightdata";

export type CheckOutcome = {
  keywordId: string;
  term: string;
  position: number | null;
  url: string | null;
  error?: string;
};

/**
 * Check a single keyword against Bright Data and persist the result.
 * Never throws — errors are captured in the returned outcome so a batch
 * run can continue past individual failures.
 */
export async function checkKeyword(keywordId: string): Promise<CheckOutcome> {
  const keyword = await prisma.keyword.findUnique({
    where: { id: keywordId },
    include: { domain: true },
  });
  if (!keyword) {
    return { keywordId, term: "", position: null, url: null, error: "Keyword not found" };
  }

  try {
    const serp = await fetchSerp({
      keyword: keyword.term,
      country: keyword.country,
      language: keyword.language,
      device: keyword.device as "desktop" | "mobile",
    });

    const result = findRanking(serp, keyword.domain.name);

    await prisma.rankCheck.create({
      data: {
        keywordId: keyword.id,
        position: result?.position ?? null,
        url: result?.url ?? null,
      },
    });

    return {
      keywordId: keyword.id,
      term: keyword.term,
      position: result?.position ?? null,
      url: result?.url ?? null,
    };
  } catch (err) {
    const message = err instanceof BrightDataError ? err.message : "Unknown error";
    return { keywordId: keyword.id, term: keyword.term, position: null, url: null, error: message };
  }
}

/**
 * Check every tracked keyword, sequentially with a small delay to stay
 * comfortably under Bright Data's rate limits. Used by the daily cron route
 * and the "refresh all" button.
 */
export async function checkAllKeywords(): Promise<CheckOutcome[]> {
  const keywords = await prisma.keyword.findMany({ select: { id: true } });
  const outcomes: CheckOutcome[] = [];

  for (const { id } of keywords) {
    outcomes.push(await checkKeyword(id));
    // Small stagger so a large keyword list doesn't fire concurrently.
    await new Promise((r) => setTimeout(r, 250));
  }

  return outcomes;
}
