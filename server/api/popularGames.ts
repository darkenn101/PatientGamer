import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async () => {
  const CLIENT_ID = process.env.IGDB_CLIENT_ID;
  const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
  const API_URL = "https://api.igdb.com/v4/games";

  if (!CLIENT_ID || !ACCESS_TOKEN) {
    return { error: "Missing IGDB credentials in environment variables" };
  }

  function addMonths(date: Date, months: number) {
    date.setMonth(date.getMonth() + months);
    return date;
  }

  const datelimit = addMonths(new Date(), -12); // six months before now
  const datetime = Math.round(datelimit.getTime() / 1000);

  try {
    const response = await axios.post(
      API_URL,
      `
      fields name, category, platforms.name, platforms.platform_logo.image_id, 
             themes.name, genres.name, cover.image_id, slug, total_rating, 
             aggregated_rating, rating_count, game_modes.name, 
             player_perspectives.name, first_release_date, storyline, summary, 
             version_parent, parent_game, cover.url, screenshots.url;
      where platforms = (48,6) & first_release_date > ${datetime} & aggregated_rating >= 80 & rating_count > 20;
      sort aggregated_rating desc;
      limit 21;
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
    console.error("IGDB popular games error:", error);
    return { error: "Failed to fetch popular games from IGDB" };
  }
});
