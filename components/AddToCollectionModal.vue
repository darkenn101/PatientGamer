<template>
  <div :class="{ 'modal-open': showModal }" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <div class="flex flex-wrap md:flex-nowrap">
        <!-- Game Cover Image -->
        <div class="flex-shrink-0 w-full md:w-1/3">
          <img
            v-if="selectedGame?.cover?.image_id"
            :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${selectedGame.cover.image_id}.jpg`"
            alt="Game Cover"
            class="w-full h-auto rounded-lg"
          />
        </div>

        <!-- Game Information and Form -->
        <div class="w-full md:w-2/3 pl-0 md:pl-6 mt-6 md:mt-0">
          <h2 class="font-bold text-lg mb-4">
            Add {{ selectedGame?.name }} to Collection
            {{ selectedGame?.rating }}
            <!-- 
            {{ selectedGame }} -->
          </h2>
          <p v-if="selectedGame?.summary" class="mb-4">
            {{
              truncate(selectedGame.summary, 30) ||
              'No summary available for this game.'
            }}
          </p>
          <p v-else class="mb-4">No summary available for this game.</p>

          <form @submit.prevent="submitForm">
            <!-- Platforms -->
            <label class="label">
              <h3 class="font-bold text-l mb-4">Platforms</h3>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="platform in selectedGame?.platforms || []"
                :key="platform.name"
                class="form-control"
              >
                <label class="cursor-pointer label">
                  <span class="label-text">{{ platform.name }}</span>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    :value="platform"
                    v-model="localPlatforms"
                  />
                </label>
              </div>
            </div>

            <!-- DLC and Expansions -->
            <label class="label mt-4">
              <span class="label-text">DLC and Expansions</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="item in dlcsAndExpansions"
                :key="item.id"
                class="w-full flex items-center space-x-4"
              >
                <img
                  v-if="item.cover?.image_id"
                  :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.image_id}.jpg`"
                  alt="DLC Cover"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <label class="flex-grow cursor-pointer">
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    :value="item"
                    v-model="selectedDlcs"
                  />
                  <br />
                  <span class="">{{ item.name }}</span>
                </label>
              </div>
            </div>

            <!-- Rating -->
            <label class="label mt-4">
              <h3 class="font-bold text-l mb-4">Rating</h3>
            </label>

            <div class="rating">
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-orange-400"
                v-model="localFormData.rating"
                :value="1"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-orange-400"
                v-model="localFormData.rating"
                :value="2"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-orange-400"
                v-model="localFormData.rating"
                :value="3"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-orange-400"
                v-model="localFormData.rating"
                :value="4"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-orange-400"
                v-model="localFormData.rating"
                :value="5"
              />
            </div>

            <!-- Progress -->
            <label class="label mt-4">
              <h3 class="font-bold text-l mb-4">Progress</h3>
            </label>
            <select
              v-model="localFormData.progress"
              class="select select-bordered w-full"
            >
              <option value="Playing">Playing</option>
              <option value="Completed">Completed</option>
              <option value="Replay">Replay</option>
              <option value="Backlog">Backlog</option>
              <option value="Abandoned">Abandoned</option>
            </select>

            <!-- Submit Button -->
            <div class="modal-action">
              <button type="button" class="btn btn-secondary" @click="close">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add to Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import useTruncate from '@/composables/useTruncate'

const { truncate } = useTruncate()

// Props
const props = defineProps({
  showModal: Boolean,
  selectedGame: Object, // Game object passed from parent
})

// Emits
const emit = defineEmits(['close', 'submit'])
// Local form state
const localPlatforms = ref([]) // To store selected platforms
const localFormData = ref({
  rating: null,
  progress: '',
})

const dlcsAndExpansions = ref([]) // Store fetched DLC and expansions
const selectedDlcs = ref([]) // Store user-selected DLC/expansions

// Fetch DLC/expansion details from IGDB
const fetchDlcsAndExpansions = async (ids) => {
  try {
    const response = await fetch('/api/fetchDlc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'games',
        ids,
        fields: ['id', 'name', 'cover.image_id'],
      }),
    })

    if (response.ok) {
      const data = await response.json()
      dlcsAndExpansions.value = data
    } else {
      console.error('Error fetching DLC/expansion details')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Fetch DLC and expansion details on mounted
// onMounted(async () => {
//   console.log("Selected Game:", props.selectedGame.dlcs);
//   if (
//     props.selectedGame?.dlcs?.length ||
//     props.selectedGame?.expansions?.length
//   ) {
//     const ids = [
//       ...(props.selectedGame.dlcs || []),
//       ...(props.selectedGame.expansions || []),
//     ];
//     await fetchDlcsAndExpansions(ids);
//   }
// });

// Watch `selectedGame` to fetch DLC/expansion details
watch(
  () => props.selectedGame,
  async (newGame) => {
    if (newGame?.dlcs?.length || newGame?.expansions?.length) {
      await fetchDlcsAndExpansions([...newGame.dlcs, ...newGame.expansions])
    } else {
      dlcsAndExpansions.value = []
    }
  },
  { immediate: true }
)

// Watch the `selectedGame` prop to update local platforms when it changes
watch(
  () => props.selectedGame?.platforms,
  (newPlatforms) => {
    if (newPlatforms) {
      localPlatforms.value = newPlatforms.map((p) => p.name) // Use platform names initially
    }
  },
  { immediate: true } // Ensure this runs when the component is mounted
)

// Close the modal
const close = () => {
  emit('close')
  localFormData.value = { rating: null, progress: '' }
}

// Submit the form
const submitForm = () => {
  console.log('Submitting form...', props.selectedGame)
  emit('submit', {
    igdbId: props.selectedGame?.id || null,
    platforms: localPlatforms.value,
    rating: localFormData.value?.rating,
    progress: localFormData.value?.progress,
    dlcs: selectedDlcs.value,
    gameData: props.selectedGame,
  })
  close()
}
</script>
