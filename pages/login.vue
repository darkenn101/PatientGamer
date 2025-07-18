<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4"
  >
    <div
      class="w-full max-w-md bg-white/90 shadow-xl rounded-2xl p-10 flex flex-col gap-8"
    >
      <div class="flex flex-col items-center gap-2">
        <img src="/logo.svg" alt="Logo" class="h-12 mb-2" />
        <h2 class="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
        <p class="text-gray-500 text-sm">
          Sign in to your account or create a new one
        </p>
      </div>
      <form @submit.prevent="signIn" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-gray-700 font-medium">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="password" class="text-gray-700 font-medium"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div v-if="errorMessage" class="text-red-500 text-sm text-center mt-2">
          {{ errorMessage }}
        </div>
        <button
          type="submit"
          class="w-full py-3 mt-2 text-white bg-blue-600 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </form>
      <div class="flex items-center gap-2">
        <div class="flex-grow h-px bg-gray-200"></div>
        <span class="text-gray-400 text-xs">or</span>
        <div class="flex-grow h-px bg-gray-200"></div>
      </div>
      <button
        @click="signUp"
        class="w-full py-3 text-blue-600 border border-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
      >
        Create Account
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({ middleware: 'auth' })

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const supabase = useSupabaseClient()
const router = useRouter()

const signIn = async () => {
  errorMessage.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMessage.value = error.message
  } else {
    router.push('/dashboard')
  }
}

const signUp = async () => {
  errorMessage.value = ''
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMessage.value = error.message
  } else {
    errorMessage.value = 'Successfully signed up! Redirecting...'
    setTimeout(() => router.push('/dashboard'), 1200)
  }
}
</script>

<style scoped>
body {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}
</style>
