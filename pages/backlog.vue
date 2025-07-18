<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Your Backlog</h1>

    <!-- Search and Filter -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <!-- Search Bar -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search games..."
        class="input input-bordered w-full sm:w-1/2"
      />

      <!-- Progress Filter -->
      <select
        v-model="selectedProgressFilter"
        class="select select-bordered w-full sm:w-1/4"
      >
        <option value="">Select Progress</option>
        <option value="Backlog">Backlog</option>
        <option value="Playing">Playing</option>
        <option value="Unplayed DLC">Unplayed DLC</option>
        <option value="Completed">Completed</option>
        <option value="Replay">Replay</option>
        <option value="Paused">Paused</option>
        <option value="Abandoned">Abandoned</option>
      </select>
    </div>

    <!-- Backlog Games Table -->
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Platform</th>
            <th>Rating</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="game in sortedBacklogGames"
            :key="game.id"
            class="hover:bg-gray-100"
          >
            <!-- Game Name -->
            <td class="font-medium">{{ game.data?.name }}</td>

            <!-- Platforms -->
            <td>
              {{ game.platforms?.join(', ') || 'N/A' }}
            </td>

            <!-- Rating -->
            <td>
              {{ game.rating || 'N/A' }}
            </td>

            <!-- Current Progress -->
            <td>
              {{ game.progress || 'N/A' }}
            </td>

            <!-- Actions -->
            <td class="flex gap-2 items-center">
              <select
                :value="game.progress"
                class="select select-sm select-bordered"
                @change="updateGameProgress(game.id, $event.target.value)"
              >
                <option value="">All</option>
                <option value="Playing">Playing</option>
                <option value="Backlog">Backlog</option>
                <option value="Unplayed DLC">Unplayed DLC</option>
                <option value="Replay">Replay</option>
                <option value="Paused">Paused</option>
              </select>
              <button
                class="btn btn-error btn-sm ml-2"
                title="Remove from Backlog"
                @click="removeFromBacklog(game.id)"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center mt-6">
      <!-- Previous Button -->
      <button
        class="btn btn-primary btn-sm"
        @click="goToPage(currentPage - 1)"
        :disabled="!hasPreviousPage"
      >
        Previous
      </button>

      <!-- Current Page Info -->
      <span class="text-sm"> Page {{ currentPage }} of {{ totalPages }} </span>

      <!-- Next Button -->
      <button
        class="btn btn-primary btn-sm"
        @click="goToPage(currentPage + 1)"
        :disabled="!hasNextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: 'admin', // Use the 'admin' layout
})

import { ref, computed, onMounted, watch } from 'vue'

const supabase = useSupabaseClient()

// State
const userId = ref('') // User's ID
const backlogGames = ref([]) // Games in the backlog
const currentPage = ref(1) // Current page number
const limit = 20 // Games per page
const totalGames = ref(0) // Total number of backlog games
const searchQuery = ref('') // Search query
const selectedProgressFilter = ref('') // Progress filter

// Computed: sort by progress order
const progressOrder = {
  Playing: 1,
  Paused: 2,
  'Unplayed DLC': 3,
  Backlog: 4,
  Replay: 5,
}
const sortedBacklogGames = computed(() => {
  return [...backlogGames.value].sort((a, b) => {
    const aOrder = progressOrder[a.progress] || 99
    const bOrder = progressOrder[b.progress] || 99
    if (aOrder !== bOrder) return aOrder - bOrder
    // fallback: alphabetical by name
    return (a.data?.name || '').localeCompare(b.data?.name || '')
  })
})

// Fetch backlog games
const fetchBacklogGames = async () => {
  try {
    const offset = (currentPage.value - 1) * limit // Calculate offset for pagination

    // Query games in the backlog
    let query = supabase
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
        { count: 'exact' }
      )
      .eq('user_id', userId.value)
      .ilike('data->>name', `%${searchQuery.value}%`)

    // If a filter is selected, filter by that progress
    if (selectedProgressFilter.value) {
      query = query.eq('progress', selectedProgressFilter.value)
    } else {
      // Otherwise, fetch all relevant progress states
      query = query.in('progress', [
        'Backlog',
        'Playing',
        'Unplayed DLC',
        'Replay',
        'Paused',
      ])
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching backlog games:', error.message)
      return
    }

    backlogGames.value = data || [] // Update backlog games
    totalGames.value = count || 0 // Update total games count
  } catch (err) {
    console.error('Unexpected error fetching backlog games:', err)
  }
}

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(totalGames.value / limit)) // Total pages
const hasNextPage = computed(() => currentPage.value < totalPages.value) // Check for next page
const hasPreviousPage = computed(() => currentPage.value > 1) // Check for previous page

// Change page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchBacklogGames() // Fetch backlog games for the new page
  }
}

// Update game progress
const updateGameProgress = async (gameId, newProgress) => {
  try {
    const { error } = await supabase
      .from('collections')
      .update({ progress: newProgress })
      .eq('id', gameId)
      .eq('user_id', userId.value)

    if (error) {
      console.error('Error updating game progress:', error.message)
      return
    }

    // Refresh backlog games after update
    fetchBacklogGames()
  } catch (err) {
    console.error('Unexpected error updating game progress:', err)
  }
}

// Mark game as Completed instead of deleting
const removeFromBacklog = async (gameId) => {
  try {
    const { error } = await supabase
      .from('collections')
      .update({ progress: 'Completed' })
      .eq('id', gameId)
      .eq('user_id', userId.value)

    if (error) {
      console.error('Error marking game as completed:', error.message)
      return
    }
    fetchBacklogGames()
  } catch (err) {
    console.error('Unexpected error marking game as completed:', err)
  }
}

// Watch for search query or progress filter changes
watch([searchQuery, selectedProgressFilter], () => {
  currentPage.value = 1 // Reset to the first page
  fetchBacklogGames()
})

// Fetch backlog games on mount
onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user?.id) {
      console.error(
        'Error fetching user:',
        error?.message || 'No user ID found'
      )
      return
    }

    userId.value = data.user.id // Set user ID
    await fetchBacklogGames() // Fetch initial backlog games
  } catch (err) {
    console.error('Unexpected error:', err)
  }
})
</script>
