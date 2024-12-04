import puppeteer from "puppeteer";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const gameName = query.name as string;

  if (!gameName) {
    return { error: "Game name is required" };
  }

  try {
    console.log(`Scraping HLTB data for: ${gameName}`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to HowLongToBeat search page
    const searchUrl = `https://howlongtobeat.com/search_results?page=1&query=${encodeURIComponent(
      gameName
    )}`;
    await page.goto(searchUrl);

    // Wait for the search results to load
    await page.waitForSelector(".search_list_tidbit");

    // Scrape the first search result
    const result = await page.evaluate(() => {
      const firstResult = document.querySelector(".search_list_tidbit");
      if (!firstResult) return null;

      const name = firstResult
        .querySelector(".search_list_title a")
        ?.textContent?.trim();
      const main = firstResult
        .querySelector(".search_list_tidbit_short")
        ?.textContent?.trim();
      const mainExtra = firstResult
        .querySelector(".search_list_tidbit_main")
        ?.textContent?.trim();
      const completionist = firstResult
        .querySelector(".search_list_tidbit_completionist")
        ?.textContent?.trim();

      return {
        name,
        main: main || null,
        main_extra: mainExtra || null,
        completionist: completionist || null,
      };
    });

    await browser.close();

    if (!result) {
      console.warn(`No results found for: ${gameName}`);
      return { error: "No results found" };
    }

    return result;
  } catch (error) {
    console.error("Error scraping HLTB:", error);
    return { error: "Failed to fetch data from HLTB." };
  }
});
