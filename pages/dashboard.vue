<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Welcome to Your Dashboard!</h1>
    <p>Here, you can view and manage your game collection.</p>
    <br />
    <br />
    <br />
    <!-- Placeholder for future game collection functionality -->
    <!-- Game Search Component -->
    <GameSearch />
  </div>
</template>

<script setup>
// Page Meta to apply middleware
definePageMeta({
  middleware: 'auth',
  layout: 'admin', // Use the 'admin' layout
})

// Ensure the user is logged in before accessing the dashboard
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

if (!user.value) {
  router.push('/login')
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
