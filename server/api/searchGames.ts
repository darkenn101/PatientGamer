import { defineEventHandler, getQuery } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchQuery = query.query as string;

  const CLIENT_ID = process.env.IGDB_CLIENT_ID;
  const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
  const API_URL = "https://api.igdb.com/v4/games";

  if (!searchQuery) {
    return { error: "No search query provided" };
  }

  if (!CLIENT_ID || !ACCESS_TOKEN) {
    return { error: "Missing IGDB credentials in environment variables" };
  }

  try {
    const response = await axios.post(
      API_URL,
      `
      
      fields name, category, platforms.name, platforms.platform_logo.image_id, 
             themes.name, genres.name, cover.image_id, slug, total_rating, rating,
             aggregated_rating, rating_count, game_modes.name, dlcs, expansions,
             player_perspectives.name, first_release_date, release_dates.date, storyline, summary, 
             version_parent, parent_game, cover.url, screenshots.url;
      search "${searchQuery}";
  
      where version_parent = null & rating != null;
      limit 25;
      `,
      {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("IGDB search error:", error);
    return { error: "Failed to fetch data from IGDB" };
  }
});
