<template>
  <div :class="{ 'modal-open': showModal }" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <div class="flex flex-wrap md:flex-nowrap">
        <!-- Game Cover Image -->
        <div class="flex-shrink-0 w-full md:w-1/3">
          <img
            v-if="gameToEdit?.cover?.image_id"
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${gameToEdit.cover.image_id}.jpg`"
            alt="Game Cover"
            class="w-full h-auto rounded-lg"
          />
        </div>

        <!-- Game Information and Form -->
        <div class="w-full md:w-2/3 pl-0 md:pl-6 mt-6 md:mt-0">
          <h2 class="font-bold text-lg mb-4">Edit {{ gameToEdit?.name }}</h2>
          <form @submit.prevent="updateGame">
            <!-- Platforms -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">Platforms</span>
              </label>
              <select
                v-model="platforms"
                class="select select-bordered"
                multiple
              >
                <option
                  v-for="platform in allPlatforms"
                  :key="platform.id"
                  :value="platform.name"
                >
                  {{ platform.name }}
                </option>
              </select>
            </div>

            <!-- Release Date -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">Release Date</span>
              </label>
              <input
                v-model="releaseDate"
                type="date"
                class="input input-bordered"
              />
            </div>

            <!-- Notes -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">Notes</span>
              </label>
              <textarea
                v-model="notes"
                class="textarea textarea-bordered"
                placeholder="Add your notes about the game..."
              ></textarea>
            </div>

            <!-- Rating -->
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">Rating</span>
              </label>
              <input
                v-model="rating"
                type="number"
                class="input input-bordered"
                min="1"
                max="10"
                placeholder="Rate the game out of 10"
              />
            </div>

            <div class="modal-action">
              <button type="submit" class="btn btn-primary">Save</button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showModal: Boolean,
  gameToEdit: Object,
})

const emit = defineEmits(['close', 'update'])

// Reactive form fields
const platforms = ref([])
const releaseDate = ref('')
const notes = ref('')
const rating = ref('')

// Mock list of platforms (replace with API data if needed)
const allPlatforms = ref([
  { id: 1, name: 'PC' },
  { id: 2, name: 'PlayStation' },
  { id: 3, name: 'Xbox' },
  { id: 4, name: 'Nintendo Switch' },
])

// Prepopulate form fields when gameToEdit changes
watch(
  () => props.gameToEdit,
  (newGame) => {
    if (newGame) {
      platforms.value = newGame.platforms || []
      releaseDate.value = newGame.releaseDate || ''
      notes.value = newGame.notes || ''
      rating.value = newGame.rating || ''
    }
  },
  { immediate: true }
)

const updateGame = async () => {
  const updatedGame = {
    ...props.gameToEdit,
    platforms: platforms.value,
    releaseDate: releaseDate.value,
    notes: notes.value,
    rating: rating.value,
  }

  // Emit update event with new data
  emit('update', updatedGame)
  emit('close')
}
</script>

<style scoped>
.modal {
  display: none;
}
.modal-open {
  display: block;
}
</style>
