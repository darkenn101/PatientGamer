import {
  genres,
  platforms,
  gameModes,
  playerPerspectives,
  themes,
} from '@/utils/searchOptions.js'
import { defineEventHandler, getQuery } from 'h3'
import axios from 'axios'

// Helper to map name to ID
const getIdByName = (name, data) => {
  const item = data.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase()
  )
  return item ? item.id : null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = query.query || null // Optional search query
  const platform = query.platform || '' // Optional platform filter
  const genre = query.genre || '' // Optional genre filter
  const gameMode = query.gameMode || '' // Optional game mode filter
  const perspective = query.perspective || '' // Optional perspective filter
  const theme = query.theme || '' // Optional theme filter
  const ids = query.ids
    ? query.ids
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : null

  // Map filters
  const genreId = genre ? getIdByName(genre, genres) : null
  const platformId = platform ? getIdByName(platform, platforms) : null
  const gameModeId = gameMode ? getIdByName(gameMode, gameModes) : null
  const perspectiveId = perspective
    ? getIdByName(perspective, playerPerspectives)
    : null
  const themeId = theme ? getIdByName(theme, themes) : null

  const CLIENT_ID = process.env.IGDB_CLIENT_ID
  const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN
  const API_URL = 'https://api.igdb.com/v4/games'

  if (!CLIENT_ID || !ACCESS_TOKEN) {
    return { error: 'Missing IGDB credentials in environment variables' }
  }

  // If ids param is present, fetch by IDs only
  if (ids && ids.length > 0) {
    try {
      const response = await axios.post(
        API_URL,
        `fields name, category, platforms.name, platforms.platform_logo.image_id, 
                themes.name, genres.name, cover.image_id, slug, total_rating, rating,
                aggregated_rating, rating_count, game_modes.name, dlcs, expansions,
                player_perspectives.name, first_release_date, release_dates.date, storyline, summary, 
                version_parent, parent_game, cover.url, screenshots.url;
         where id = (${ids.join(',')});
         limit ${ids.length};
        `,
        {
          headers: {
            'Client-ID': CLIENT_ID,
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('IGDB fetch by ids error:', error)
      return { error: 'Failed to fetch games by ids from IGDB' }
    }
  }

  // Otherwise, do normal search/filter
  const filters = []
  if (platformId) filters.push(`platforms = {${platformId}}`)
  if (genreId) filters.push(`genres = {${genreId}}`)
  if (gameModeId) filters.push(`game_modes = {${gameModeId}}`)
  if (perspectiveId) filters.push(`player_perspectives = {${perspectiveId}}`)
  if (themeId) filters.push(`themes = {${themeId}}`)

  const whereClause = `
    rating != null
    ${filters.length > 0 ? `& ${filters.join(' & ')}` : ''}
  `
  console.log('IGDB search:', whereClause)
  try {
    const response = await axios.post(
      API_URL,
      `
      fields name, category, platforms.name, platforms.platform_logo.image_id, 
             themes.name, genres.name, cover.image_id, slug, total_rating, rating,
             aggregated_rating, rating_count, game_modes.name, dlcs, expansions,
             player_perspectives.name, first_release_date, release_dates.date, storyline, summary, 
             version_parent, parent_game, cover.url, screenshots.url;
      ${searchQuery ? `search "${searchQuery}";` : ''}
      where ${whereClause.trim()};
      sort rating desc;
      limit 25;
      `,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('IGDB search error:', error)
    return { error: 'Failed to fetch data from IGDB' }
  }
})
