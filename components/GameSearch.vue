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

<script setup>
import { ref, computed, onMounted } from "vue";
import useTruncate from "@/composables/useTruncate";

const supabase = useSupabaseClient();

const searchQuery = ref("");

const searchResults = ref([]);
const popularGames = ref([]);

const displayedGames = computed(() =>
  searchResults.value.length ? searchResults.value : popularGames.value
);

const loading = ref(false);

const { truncate } = useTruncate();

onMounted(() => {
  fetchGameStatus();
  fetchPopularGames();
});

const fetchPopularGames = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/popularGames");
    const data = await response.json();

    if (response.ok) {
      popularGames.value = data;
      await fetchGameStatus();
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
      await fetchGameStatus();
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

const addToCollection = async (formData) => {
  const { igdbId, platforms, rating, progress, gameData } = formData;

  try {
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user?.id) {
      console.error("User not authenticated:", userError?.message);
      return;
    }

    const userId = user.id;

    const { data: existingInCollection } = await supabase
      .from("collections")
      .select("id")
      .eq("user_id", userId)
      .eq("igdb_id", igdbId)
      .maybeSingle();

    if (existingInCollection) {
      console.log(`Game with IGDB ID ${igdbId} is already in your collection.`);
      return;
    }

    const hltbData = await fetchHowLongToBeat(gameData.name);

    const { error: insertError } = await supabase.from("collections").insert([
      {
        user_id: userId,
        igdb_id: igdbId,
        platforms,
        rating,
        data: gameData,
        progress,
        how_long_to_beat: hltbData,
      },
    ]);

    if (insertError) {
      console.error("Error adding game to collection:", insertError.message);
    } else {
      console.log(`Game with IGDB ID ${igdbId} successfully added.`);
      await fetchGameStatus();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

const showModal = ref(false); // Tracks modal visibility
const selectedGame = ref(null); // Stores the selected game's data

const openGameModal = (game) => {
  selectedGame.value = game; // Set the selected game
  showModal.value = true; // Open the modal
};

const closeModal = () => {
  showModal.value = false; // Close the modal
  selectedGame.value = null; // Reset the selected game
};

const addToWishlist = async (igdbId) => {
  try {
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user?.id) {
      console.error("User not authenticated:", userError?.message);
      return;
    }

    const userId = user.id;

    const { data: existingInCollection } = await supabase
      .from("collections")
      .select("id")
      .eq("user_id", userId)
      .eq("igdb_id", igdbId)
      .maybeSingle();

    if (existingInCollection) {
      console.log(`Game is already in your collection.`);
      return;
    }

    const { error: insertError } = await supabase.from("wishlists").insert([
      {
        user_id: userId,
        igdb_id: igdbId,
      },
    ]);

    if (insertError) {
      console.error("Error adding to wishlist:", insertError.message);
    } else {
      console.log(`Game added to wishlist.`);
      await fetchGameStatus();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

const fetchGameStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error.message);
      return;
    }

    const user = data?.user;

    if (!user || !user.id) {
      console.error("User not authenticated or user ID is missing");
      return;
    }

    const userId = user.id;
    const gameIds = displayedGames.value.map((game) => game.id);

    const { data: collectionData, error: collectionError } = await supabase
      .from("collections")
      .select("igdb_id")
      .eq("user_id", userId)
      .in("igdb_id", gameIds);

    if (collectionError) {
      console.error("Error fetching collection data:", collectionError.message);
      return;
    }

    const { data: wishlistData, error: wishlistError } = await supabase
      .from("wishlists")
      .select("igdb_id")
      .eq("user_id", userId)
      .in("igdb_id", gameIds);

    if (wishlistError) {
      console.error("Error fetching wishlist data:", wishlistError.message);
      return;
    }

    displayedGames.value.forEach((game) => {
      game.inCollection = collectionData?.some(
        (item) => item.igdb_id === game.id
      );
      game.inWishlist = wishlistData?.some((item) => item.igdb_id === game.id);
    });
  } catch (err) {
    console.error("Unexpected error in fetchGameStatus:", err);
  }
};

const fetchHowLongToBeat = async (gameName) => {
  return null;
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
