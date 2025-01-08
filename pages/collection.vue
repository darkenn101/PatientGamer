<template>
  <div class="collection-page">
    <h1 class="text-2xl font-bold mb-4">My Collection</h1>

    <!-- Search Bar -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search in your collection..."
      class="input input-bordered w-full mb-4"
    />

    <!-- Games Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="game in collectionGames"
        :key="game.id"
        class="card card-side bg-base-100 shadow-xl"
      >
        <figure class="w-[200px]">
          <img
            v-if="game.data.cover?.image_id"
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.data.cover?.image_id}.jpg`"
            alt="Game Cover"
            class="w-[200px] h-full object-cover"
          />
        </figure>
        <div class="card-body">
          <h2 class="card-title text-xl font-bold">{{ game.data.name }}</h2>
          <p>{{ game.data.summary || 'No summary available.' }}</p>
          <p>
            <strong>Platforms:</strong>
            <span v-if="game.platforms?.length">
              <span
                v-for="(platform, index) in game.platforms"
                :key="platform.id"
              >
                {{ platform.name
                }}<span v-if="index < game.platforms.length - 1">, </span>
              </span>
            </span>
            <span v-else>N/A</span>
          </p>
          <p><strong>Progress:</strong> {{ game.progress || 'N/A' }}</p>
          <p><strong>Rating:</strong> {{ game.rating || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <button
        class="btn btn-primary"
        :disabled="!hasPreviousPage"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        class="btn btn-primary"
        :disabled="!hasNextPage"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
definePageMeta({
  layout: 'admin', // Use the 'admin' layout
})

// Supabase client
const supabase = useSupabaseClient()

// State
const userId = ref('') // User's ID
const currentPage = ref(1) // Current page number
const limit = 6 // Number of games per page
const totalGames = ref(0) // Total number of games in the collection
const searchQuery = ref('') // Search query

const collectionGames = ref([]) // Array of games from the collection

// Fetch the collection for the current page
const fetchCollection = async () => {
  try {
    const offset = (currentPage.value - 1) * limit // Calculate offset for pagination

    // Fetch games from the collection table
    const { data, count, error } = await supabase
      .from('collections')
      .select(
        `
          id,
          user_id,
          igdb_id,
          data,
          platforms,
          rating,
          progress
        `,
        { count: 'exact' } // Include total count of matching rows
      )
      .eq('user_id', userId.value) // Filter by user ID
      .ilike('data->>name', `%${searchQuery.value}%`) // Search by name in JSONB column
      .range(offset, offset + limit - 1) // Apply pagination

    if (error) {
      console.error('Error fetching collection:', error.message)
      return
    }

    collectionGames.value = data || [] // Assign fetched data to collectionGames
    totalGames.value = count || 0 // Update total number of games
  } catch (err) {
    console.error('Unexpected error fetching collection:', err)
  }
}

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(totalGames.value / limit)) // Total pages
const hasNextPage = computed(() => currentPage.value < totalPages.value) // Check for next page
const hasPreviousPage = computed(() => currentPage.value > 1) // Check for previous page

// Navigate to a specific page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCollection() // Fetch collection for the new page
  }
}

// Watch the search query for real-time updates
watch(searchQuery, () => {
  currentPage.value = 1 // Reset to the first page when the query changes
  fetchCollection() // Fetch collection based on the new search query
})

// Fetch the initial collection on mount
onMounted(async () => {
  try {
    // Get the logged-in user's ID
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user?.id) {
      console.error(
        'Error fetching user:',
        error?.message || 'No user ID found'
      )
      return
    }

    userId.value = data.user.id // Set the user's ID
    await fetchCollection() // Fetch the initial collection
  } catch (err) {
    console.error('Unexpected error:', err)
  }
})
</script>
