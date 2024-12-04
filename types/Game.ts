// src/types/Game.ts
export interface Game {
  id: number;
  name: string;
  platforms?: {
    name: string;
    id: string;
    platform_logo?: { image_id: string };
  }[];
  rating?: number;
  progress?: string;
  data: {
    summary: string;
    cover?: { image_id: string };
    category?: string;
    platforms?: { name: string; platform_logo?: { image_id: string } }[];
    themes?: { name: string }[];
    genres?: { name: string }[];
    total_rating?: number;
    aggregated_rating?: number;
    rating_count?: number;
    game_modes?: { name: string }[];
    player_perspectives?: { name: string }[];
    first_release_date?: number;
    storyline?: string;
    slug?: string;
    version_parent?: number;
    parent_game?: number;
    [key: string]: any;
  };
}
