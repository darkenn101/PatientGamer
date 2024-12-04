import axios from "axios";

const clientId = process.env.IGDB_CLIENT_ID as string;
const accessToken = process.env.IGDB_ACCESS_TOKEN as string;

export const searchGames = async (query: string) => {
  try {
    const response = await axios({
      url: "https://api.igdb.com/v4/games",
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      data: `search "${query}"; fields name, genres, cover.url;`,
    });
    return response.data;
  } catch (error) {
    console.error("IGDB search error:", error);
    return [];
  }
};
