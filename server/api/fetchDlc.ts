import { defineEventHandler, readBody } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ids, endpoint, fields } = body;

  const CLIENT_ID = process.env.IGDB_CLIENT_ID;
  const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
  const API_URL = `https://api.igdb.com/v4/${endpoint}`;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return { error: "No IDs provided" };
  }

  if (!CLIENT_ID || !ACCESS_TOKEN) {
    return { error: "Missing IGDB credentials in environment variables" };
  }

  try {
    const response = await axios.post(
      API_URL,
      `fields ${fields.join(", ")}; where id = (${ids.join(",")}); limit ${
        ids.length
      };`,
      {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("IGDB fetch error:", error);
    return { error: "Failed to fetch data from IGDB" };
  }
});
