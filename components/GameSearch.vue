<template>
  <div class="mb-8">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search for a game..."
      class="input input-bordered w-full"
    />
    <button @click="handleSearch" class="btn btn-primary w-full mt-2">
      Search
    </button>

    <div v-if="loading" class="text-center mt-4">
      <p class="text-info">Loading...</p>
    </div>

    <div
      v-if="displayedGames.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="game in displayedGames"
        :key="game.id"
        class="card card-side bg-base-100 shadow-xl w-full lg:max-w-[600px] mx-auto"
      >
        <figure class="w-[200px] flex-shrink-0">
          <img
            v-if="game.cover?.image_id"
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover?.image_id}.jpg`"
            alt="Game Cover"
            class="w-[200px] h-full object-cover"
          />
        </figure>
        <div class="card-body flex flex-col justify-between">
          <h2 class="card-title text-xl font-bold">{{ game.name }}</h2>
          <p class="line-clamp-3">
            {{
              truncate(game.summary, 15) ||
              "No summary available for this game."
            }}
          </p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary" @click="openGameModal(game)">
              {{ game.inCollection ? "In Collection" : "Add to Collection" }}
            </button>
            <button class="btn btn-secondary" @click="addToWishlist(game.id)">
              {{ game.inWishlist ? "In Wishlist" : "Add to Wishlist" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Add to Collection Modal -->
    <AddToCollectionModal
      :showModal="showModal"
      :selectedGame="selectedGame"
      @close="closeModal"
      @submit="addToCollection"
    />
  </div>

  <!-- <div v-for="game in displayedGames">{{ game }} <br /><br /></div> -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import useTruncate from "@/composables/useTruncate";
import type { Game } from "@/types/Game"; // Adjust the path if necessary

const supabase = useSupabaseClient();

const searchQuery = ref<string>("");
const searchResults = ref<any[]>([]);
const popularGames = ref<any[]>([]);
const loading = ref<boolean>(false);

const { truncate } = useTruncate();

onMounted(() => {
  fetchGameStatus();
  fetchPopularGames();
});

// Combine popular games and search results dynamically
const displayedGames = computed(() =>
  searchResults.value.length ? searchResults.value : popularGames.value
);

// Fetch popular games
const fetchPopularGames = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/popularGames");
    const data = await response.json();

    if (response.ok) {
      popularGames.value = data; // Update popularGames array

      await fetchGameStatus(); // Check collection and wishlist status for the results
    } else {
      console.error("Error fetching popular games:", data.error);
      alert("Failed to fetch popular games.");
    }
  } catch (error) {
    console.error("Unexpected error fetching popular games:", error);
    alert("An error occurred while fetching popular games.");
  } finally {
    loading.value = false;
  }
};

// Function to search for games
const handleSearch = async () => {
  if (!searchQuery.value) {
    alert("Please enter a search query");
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(
      `/api/searchGames?query=${encodeURIComponent(searchQuery.value)}`
    );
    const data = await response.json();

    if (response.ok) {
      searchResults.value = data;
      await fetchGameStatus(); // Check collection and wishlist status for the results
    } else {
      console.error("Search error:", data.error);
      alert("Failed to search for games");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An error occurred while searching for games");
  } finally {
    loading.value = false;
  }
};

// Function to add a game to the collection
const addToCollection = async (formData: any) => {
  const { igdbId, platforms, rating, progress, gameData } = formData;

  try {
    // Step 1: Get the authenticated user
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;
    console.log("IGDB ID being added to collection:", igdbId, platforms);

    if (userError || !user?.id) {
      console.error(
        "User not authenticated:",
        userError?.message || "No user ID found"
      );
      return;
    }

    const userId = user.id;

    // Step 2: Check if the game is already in the collections table
    const { data: existingInCollection, error: collectionError } =
      await supabase
        .from("collections")
        .select("id")
        .eq("user_id", userId)
        .eq("igdb_id", igdbId)
        .maybeSingle();

    if (collectionError && collectionError.code !== "PGRST116") {
      console.error("Error checking for game in collections:", collectionError);
      return;
    }

    console.log(existingInCollection);

    if (existingInCollection) {
      console.log(`Game with IGDB ID ${igdbId} is already in your collection.`);
      return;
    }

    // Step 3: Check if the game is in the wishlists table
    const { data: existingInWishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("igdb_id", igdbId)
      .single();

    if (wishlistError && wishlistError.code !== "PGRST116") {
      console.error(
        "Error checking for game in wishlists:",
        wishlistError.message
      );
      return;
    }

    // Step 4: Remove the game from wishlists if it exists
    if (existingInWishlist) {
      const { error: deleteError } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("igdb_id", igdbId)
        .single();

      if (deleteError) {
        console.error(
          "Error removing game from wishlists:",
          deleteError.message
        );
        return;
      }

      console.log(`Game with IGDB ID ${igdbId} removed from your wishlist.`);
    }

    // Fetch HLTB data from the server endpoint
    const hltbData = await fetchHowLongToBeat(gameData.name);
    // Step 5: Add the game to the collections table
    const { error: insertError } = await supabase.from("collections").insert([
      {
        user_id: userId,
        igdb_id: igdbId,
        platforms: platforms,
        rating: rating,
        data: gameData,
        progress: progress,
        how_long_to_beat: hltbData,
      },
    ]);

    if (insertError) {
      console.error("Error adding game to collection:", insertError.message);
    } else {
      console.log(
        `Game with IGDB ID ${igdbId} successfully added to your collection.`
      );

      // Refresh statuses after adding the game
      await fetchGameStatus();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

const showModal = ref(false); // Modal visibility
const selectedGame = ref<Game | []>([]); // Allow null or a valid Game object

// Open the modal
const openGameModal = (game: any) => {
  console.log("Opening modal for game:", game);
  selectedGame.value = game;
  showModal.value = true;
};

// Close the modal
const closeModal = () => {
  showModal.value = false;
  selectedGame.value = [];
};

// Function to add a game to the wishlist
const addToWishlist = async (igdbId: number) => {
  try {
    // Step 1: Get the authenticated user
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user?.id) {
      console.error(
        "User not authenticated:",
        userError?.message || "No user ID found"
      );
      return;
    }

    const userId = user.id;

    // Step 2: Check if the game is already in the collections table
    const { data: existingInCollection, error: collectionError } =
      await supabase
        .from("collections")
        .select("id")
        .eq("user_id", userId)
        .eq("igdb_id", igdbId)
        .single();

    if (collectionError && collectionError.code !== "PGRST116") {
      console.error(
        "Error checking for game in collections:",
        collectionError.message
      );
      return;
    }

    if (existingInCollection) {
      console.log(
        `Game with IGDB ID ${igdbId} is already in your collection and cannot be added to your wishlist.`
      );
      return;
    }

    // Step 3: Check if the game is already in the wishlists table
    const { data: existingInWishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("igdb_id", igdbId)
      .single();

    if (wishlistError && wishlistError.code !== "PGRST116") {
      console.error(
        "Error checking for game in wishlists:",
        wishlistError.message
      );
      return;
    }

    if (existingInWishlist) {
      console.log(`Game with IGDB ID ${igdbId} is already in your wishlist.`);
      return;
    }

    // Step 4: Add the game to the wishlists table
    const { error: insertError } = await supabase.from("wishlists").insert([
      {
        user_id: userId,
        igdb_id: igdbId,
      },
    ]);

    if (insertError) {
      console.error("Error adding game to wishlist:", insertError.message);
    } else {
      console.log(
        `Game with IGDB ID ${igdbId} successfully added to your wishlist.`
      );

      // Refresh statuses after adding the game
      await fetchGameStatus();
    }
  } catch (err) {
    console.error("Unexpected error adding to wishlist:", err);
  }
};

// Function to check if games are in collection or wishlist
const fetchGameStatus = async () => {
  const user = await supabase.auth.getUser();
  if (!user.data?.user?.id) {
    console.error("User not authenticated");
    return;
  }

  const userId = user.data.user.id;
  const gameIds = displayedGames.value.map((game) => game.id); // Extract IGDB IDs

  // Batch query for collection and wishlist
  const { data: collectionData } = await supabase
    .from("collections")
    .select("igdb_id")
    .eq("user_id", userId)
    .in("igdb_id", gameIds);

  const { data: wishlistData } = await supabase
    .from("wishlists")
    .select("igdb_id")
    .eq("user_id", userId)
    .in("igdb_id", gameIds);

  // Update the games list with status
  displayedGames.value.forEach((game) => {
    game.inCollection = collectionData?.some(
      (item) => item.igdb_id === game.id
    );
    game.inWishlist = wishlistData?.some((item) => item.igdb_id === game.id);
  });
};

const fetchHowLongToBeat = async (gameName: string) => {
  return null; // Placeholder for now
  try {
    const response = await fetch(
      `/api/scrapeHowLongToBeat?name=${encodeURIComponent(gameName)}`
    );
    const data = await response.json();

    if (data.error) {
      console.warn(data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching HLTB data:", error);
    return null;
  }
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
