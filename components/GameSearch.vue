<template>
  <div class="mb-8">
    <div>
      <!-- Search Box -->
      <div class="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search games..."
          class="input input-bordered w-full md:w-1/3"
        />
        <button class="btn btn-secondary" @click="toggleAdvancedSearch">
          {{
            showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'
          }}
        </button>
        <button class="btn btn-primary" @click="handleSearch">Search</button>
      </div>

      <!-- Advanced Search Options -->
      <div v-if="showAdvancedSearch" class="p-4 border rounded-lg bg-base-200">
        <h3 class="font-bold mb-4">Advanced Search</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Platform -->
          <div>
            <label class="label">
              <span class="label-text">Platform</span>
            </label>
            <select
              v-model="selectedPlatform"
              class="select select-bordered w-full"
            >
              <option value="">All Platforms</option>
              <option
                v-for="platform in SearchPlatforms"
                :key="platform.id"
                :value="platform.name"
              >
                {{ platform.name }}
              </option>
            </select>
          </div>

          <!-- Genre -->
          <div>
            <label class="label">
              <span class="label-text">Genre</span>
            </label>
            <select
              v-model="selectedGenre"
              class="select select-bordered w-full"
            >
              <option value="">All Genres</option>
              <option
                v-for="genre in SearchGenres"
                :key="genre.id"
                :value="genre.name"
              >
                {{ genre.name }}
              </option>
            </select>
          </div>

          <!-- Game Modes -->
          <div>
            <label class="label">
              <span class="label-text">Game Modes</span>
            </label>
            <select
              v-model="selectedGameMode"
              class="select select-bordered w-full"
            >
              <option value="">All Modes</option>
              <option
                v-for="mode in SearchGameModes"
                :key="mode.id"
                :value="mode.name"
              >
                {{ mode.name }}
              </option>
            </select>
          </div>

          <!-- Player Perspectives -->
          <div>
            <label class="label">
              <span class="label-text">Player Perspectives</span>
            </label>
            <select
              v-model="selectedPerspective"
              class="select select-bordered w-full"
            >
              <option value="">All Perspectives</option>
              <option
                v-for="perspective in SearchPerspectives"
                :key="perspective.id"
                :value="perspective.name"
              >
                {{ perspective.name }}
              </option>
            </select>
          </div>

          <!-- Themes -->
          <div>
            <label class="label">
              <span class="label-text">Themes</span>
            </label>
            <select
              v-model="selectedTheme"
              class="select select-bordered w-full"
            >
              <option value="">All Themes</option>
              <option
                v-for="theme in SearchThemes"
                :key="theme.id"
                :value="theme.name"
              >
                {{ theme.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Actions</span>
            </label>
            <button
              class="btn btn-secondary mr-4"
              @click="toggleAdvancedSearch"
            >
              {{
                showAdvancedSearch
                  ? 'Hide Advanced Search'
                  : 'Show Advanced Search'
              }}
            </button>
            <button class="btn btn-primary" @click="handleSearch">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>

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
              'No summary available for this game.'
            }}
          </p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary" @click="openGameModal(game)">
              {{ game.inCollection ? 'In Collection' : 'Add to Collection' }}
            </button>
            <button class="btn btn-secondary" @click="addToWishlist(game.id)">
              {{ game.inWishlist ? 'In Wishlist' : 'Add to Wishlist' }}
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

    <AddToCollectionModal
      v-if="showModal"
      :showModal="showModal"
      :mode="'add'"
      :selectedGame="selectedGame"
      @close="closeModal"
      @submit="addToCollection"
    />
  </div>

  <!-- <div v-for="game in displayedGames">{{ game }} <br /><br /></div> -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import useTruncate from '@/composables/useTruncate'
import {
  platforms,
  genres,
  gameModes,
  playerPerspectives,
  themes,
} from '@/utils/searchOptions.js'

const supabase = useSupabaseClient()

onMounted(() => {
  fetchGameStatus()
  fetchPopularGames()
})

// Search and Filter
const loading = ref(false)
const searchQuery = ref('')
const showAdvancedSearch = ref(false)
const selectedPlatform = ref('')
const selectedGenre = ref('')
const selectedGameMode = ref('')
const selectedPerspective = ref('')
const selectedTheme = ref('')

// Computed properties for dynamically updated data
const SearchPlatforms = computed(() => platforms)
const SearchGenres = computed(() => genres)
const SearchGameModes = computed(() => gameModes)
const SearchPerspectives = computed(() => playerPerspectives)
const SearchThemes = computed(() => themes)

const searchResults = ref([])
const popularGames = ref([])

// Toggle advanced search
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
}

const currentPage = ref(1)
const limit = 25 // Number of results per page
const offset = ref(0)

// Perform search
const handleSearch = async () => {
  if (!searchQuery.value && !showAdvancedSearch.value) {
    alert('Please enter a search query')
    return
  }

  loading.value = true

  try {
    // Build the query string with advanced options
    const params = new URLSearchParams({
      query: searchQuery.value,
      platform: selectedPlatform.value || '',
      genre: selectedGenre.value || '',
      gameMode: selectedGameMode.value || '',
      perspective: selectedPerspective.value || '',
      theme: selectedTheme.value || '',
      limit: limit.value || 25,
      offset: offset.value || 0,
    })

    const response = await fetch(`/api/searchGames?${params.toString()}`)
    const data = await response.json()

    if (response.ok) {
      searchResults.value = data
      await fetchGameStatus()
    } else {
      console.error('Search error:', data.error)
      alert('Failed to search for games')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    alert('An error occurred while searching for games')
  } finally {
    loading.value = false
  }
}

const displayedGames = computed(() =>
  searchResults.value.length ? searchResults.value : popularGames.value
)

const fetchPopularGames = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/popularGames')
    const data = await response.json()

    if (response.ok) {
      popularGames.value = data
      await fetchGameStatus()
    } else {
      console.error('Error fetching popular games:', data.error)
      alert('Failed to fetch popular games.')
    }
  } catch (error) {
    console.error('Unexpected error fetching popular games:', error)
    alert('An error occurred while fetching popular games.')
  } finally {
    loading.value = false
  }
}

const addToCollection = async (formData) => {
  const { igdbId, platforms, rating, progress, gameData } = formData

  try {
    const { data, error: userError } = await supabase.auth.getUser()
    const user = data?.user

    if (userError || !user?.id) {
      console.error('User not authenticated:', userError?.message)
      return
    }

    const userId = user.id

    const { data: existingInCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId)
      .eq('igdb_id', igdbId)
      .maybeSingle()

    if (existingInCollection) {
      console.log(`Game with IGDB ID ${igdbId} is already in your collection.`)
      return
    }

    const hltbData = await fetchHowLongToBeat(gameData.name)

    const { error: insertError } = await supabase.from('collections').insert([
      {
        user_id: userId,
        igdb_id: igdbId,
        platforms,
        rating,
        data: gameData,
        progress,
        how_long_to_beat: hltbData,
      },
    ])

    if (insertError) {
      console.error('Error adding game to collection:', insertError.message)
    } else {
      console.log(`Game with IGDB ID ${igdbId} successfully added.`)
      await fetchGameStatus()
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

const addToWishlist = async (igdbId) => {
  try {
    const { data, error: userError } = await supabase.auth.getUser()
    const user = data?.user

    if (userError || !user?.id) {
      console.error('User not authenticated:', userError?.message)
      return
    }

    const userId = user.id

    const { data: existingInCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId)
      .eq('igdb_id', igdbId)
      .maybeSingle()

    if (existingInCollection) {
      console.log(`Game is already in your collection.`)
      return
    }

    const { error: insertError } = await supabase.from('wishlists').insert([
      {
        user_id: userId,
        igdb_id: igdbId,
      },
    ])

    if (insertError) {
      console.error('Error adding to wishlist:', insertError.message)
    } else {
      console.log(`Game added to wishlist.`)
      await fetchGameStatus()
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

const fetchGameStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching user:', error.message)
      return
    }

    const user = data?.user

    if (!user || !user.id) {
      console.error('User not authenticated or user ID is missing')
      return
    }

    const userId = user.id
    const gameIds = displayedGames.value.map((game) => game.id)

    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .select('igdb_id')
      .eq('user_id', userId)
      .in('igdb_id', gameIds)

    if (collectionError) {
      console.error('Error fetching collection data:', collectionError.message)
      return
    }

    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .select('igdb_id')
      .eq('user_id', userId)
      .in('igdb_id', gameIds)

    if (wishlistError) {
      console.error('Error fetching wishlist data:', wishlistError.message)
      return
    }

    displayedGames.value.forEach((game) => {
      game.inCollection = collectionData?.some(
        (item) => item.igdb_id === game.id
      )
      game.inWishlist = wishlistData?.some((item) => item.igdb_id === game.id)
    })
  } catch (err) {
    console.error('Unexpected error in fetchGameStatus:', err)
  }
}

const fetchHowLongToBeat = async (gameName) => {
  return null
}

// Ulitity functions
const showModal = ref(false) // Tracks modal visibility
const selectedGame = ref(null) // Stores the selected game's data

const openGameModal = (game) => {
  selectedGame.value = game // Set the selected game
  showModal.value = true // Open the modal
}

const closeModal = () => {
  showModal.value = false // Close the modal
  selectedGame.value = null // Reset the selected game
}

const { truncate } = useTruncate()
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
