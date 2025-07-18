<template>
  <aside
    class="flex flex-col items-center h-screen sticky top-0 overflow-y-auto space-y-4 w-72 py-6 px-4 bg-base-200"
  >
    <h2 class="font-bold text-lg">{{ userDisplayName }}</h2>
    <span class="text-sm text-accent">{{ userEmail }}</span>

    <ul class="menu menu-lg w-full">
      <li>
        <NuxtLink to="/dashboard" active-class="active">
          <i class="fa-solid fa-inbox fa-fw"></i>
          Dashboard
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/collection" active-class="active">
          <i class="fa-solid fa-user fa-fw"></i>
          Collection
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/backlog" active-class="active">
          <i class="fa-solid fa-ticket fa-fw"></i>
          Backlog
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/wishlist" active-class="active">
          <i class="fa-solid fa-ticket fa-fw"></i>
          Wishlist
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/settings" active-class="active">
          <i class="fa-solid fa-gear fa-fw"></i>
          Settings
        </NuxtLink>
      </li>
    </ul>
    <button
      @click="signOut"
      class="mt-auto w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
    >
      <i class="fa-solid fa-right-from-bracket"></i>
      Sign Out
    </button>
  </aside>
</template>

<script setup>
const supabase = useSupabaseClient()
const router = useRouter()
import { ref, onMounted } from 'vue'

const userDisplayName = ref('')
const userEmail = ref('')

const fetchUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    console.log('User fetched:', user)
    userDisplayName.value =
      user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    userEmail.value = user.email || ''
  } else {
    console.log('No user found, redirecting to login')
  }
}

onMounted(fetchUser)

const signOut = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>
