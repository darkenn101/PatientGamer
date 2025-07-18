<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">My Wishlist</h1>
    <div v-if="loading" class="text-center text-info">Loading...</div>
    <div
      v-else-if="wishlistGames.length === 0"
      class="text-center text-gray-500"
    >
      Your wishlist is empty.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="game in wishlistGames"
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
              Add to Collection
            </button>
          </div>
        </div>
      </div>
    </div>
    <AddToCollectionModal
      v-if="showModal"
      :showModal="showModal"
      :mode="'add'"
      :selectedGame="selectedGame"
      @close="closeModal"
      @submit="addToCollection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useTruncate from '@/composables/useTruncate'
import AddToCollectionModal from '@/components/AddToCollectionModal.vue'

definePageMeta({
  layout: 'admin', // Use the 'admin' layout
})

const supabase = useSupabaseClient()
const loading = ref(true)
const wishlistGames = ref([])
const { truncate } = useTruncate()

const showModal = ref(false)
const selectedGame = ref(null)

const openGameModal = (game) => {
  selectedGame.value = game
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedGame.value = null
}

const addToCollection = async (formData) => {
  const { igdbId, platforms, rating, progress, gameData } = formData
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user?.id) return
    // Check if already in collection
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('igdb_id', igdbId)
      .maybeSingle()
    if (existing) return
    // Insert into collection
    await supabase.from('collections').insert([
      {
        user_id: user.id,
        igdb_id: igdbId,
        platforms,
        rating,
        data: gameData,
        progress,
      },
    ])
    // Remove from wishlist
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('igdb_id', igdbId)
    await fetchWishlist()
    closeModal()
  } catch (err) {}
}

const fetchWishlist = async () => {
  loading.value = true
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user?.id) {
      wishlistGames.value = []
      return
    }
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('igdb_id')
      .eq('user_id', user.id)
    if (wishlistError) {
      wishlistGames.value = []
      return
    }
    const igdbIds = wishlist.map((w) => w.igdb_id)
    if (!igdbIds.length) {
      wishlistGames.value = []
      return
    }
    // Fetch game details from your API (assuming /api/searchGames supports ids param)
    const response = await fetch(`/api/searchGames?ids=${igdbIds.join(',')}`)
    const games = await response.json()
    wishlistGames.value = games
  } catch (err) {
    wishlistGames.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchWishlist)
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
