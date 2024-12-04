<template>
  <div :class="{ 'modal-open': showModal }" class="modal">
    <div class="modal-box">
      <!-- Game Information -->
      <h3 class="font-bold text-lg">
        Add {{ selectedGame?.name }} to Collection
      </h3>
      <img
        v-if="selectedGame?.cover?.image_id"
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${selectedGame.cover.image_id}.jpg`"
        alt="Game Cover"
        class="w-40 mx-auto my-4"
      />
      <p v-if="selectedGame?.summary" class="mb-4">
        {{
          truncate(selectedGame.summary, 30) ||
          "No summary available for this game."
        }}
      </p>
      <p v-else class="mb-4">No summary available for this game.</p>

      <form @submit.prevent="submitForm">
        <!-- Platforms -->
        <label class="label">
          <span class="label-text">Platforms</span>
        </label>
        <select
          v-model="localPlatforms"
          multiple
          class="select select-bordered w-full"
        >
          <option
            v-for="platform in selectedGame?.platforms || []"
            :key="platform.name"
            :value="platform"
          >
            {{ platform.name }}
          </option>
        </select>

        <!-- Rating -->
        <label class="label mt-4">
          <span class="label-text">Rating</span>
        </label>
        <input
          v-model="localFormData.rating"
          type="number"
          class="input input-bordered w-full"
          placeholder="Enter your rating (e.g., 1-10)"
          min="1"
          max="10"
        />

        <!-- Progress -->
        <label class="label mt-4">
          <span class="label-text">Progress</span>
        </label>
        <select
          v-model="localFormData.progress"
          class="select select-bordered w-full"
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
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
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import useTruncate from "@/composables/useTruncate";

const { truncate } = useTruncate();

// Props
const props = defineProps({
  showModal: Boolean,
  selectedGame: Object, // Game object passed from parent
});

// Emits
const emit = defineEmits(["close", "submit"]);
// Local form state
const localPlatforms = ref<string[]>([]); // To store selected platforms
const localFormData = ref({
  rating: null as number | null,
  progress: "",
});

// Watch the `selectedGame` prop to update local platforms when it changes
watch(
  () => props.selectedGame?.platforms,
  (newPlatforms) => {
    if (newPlatforms) {
      localPlatforms.value = newPlatforms.map((p: any) => p.name); // Use platform names initially
    }
  },
  { immediate: true } // Ensure this runs when the component is mounted
);

// Close the modal
const close = () => {
  emit("close");
  localFormData.value = { rating: null, progress: "" };
};

// Submit the form
const submitForm = () => {
  console.log("Submitting form...", props.selectedGame);
  emit("submit", {
    igdbId: props.selectedGame?.id || null,
    platforms: localPlatforms.value,
    rating: localFormData.value?.rating,
    progress: localFormData.value?.progress,
    gameData: props.selectedGame,
  });
  close();
};
</script>
