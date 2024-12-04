import { HowLongToBeatService } from "howlongtobeat";

const hltbService = new HowLongToBeatService();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const gameName = query.name as string;

  if (!gameName) {
    return { error: "Game name is required" };
  }

  try {
    const results = await hltbService.search(gameName);

    if (results.length === 0) {
      return { error: "No results found" };
    }

    const bestMatch = results[0];

    return {
      main: bestMatch.gameplayMain,
      main_extra: bestMatch.gameplayMainExtra,
      completionist: bestMatch.gameplayCompletionist,
    };
  } catch (error) {
    console.error("Error fetching HLTB data:", error);
    return { error: "Failed to fetch data" };
  }
});
