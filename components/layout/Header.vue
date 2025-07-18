<template>
  <!-- Navbar -->
  <nav class="navbar justify-between bg-base-300">
    <!-- Logo -->
    <a class="btn btn-ghost text-lg">
      <img alt="Logo" src="/logo.svg" class="" />
    </a>

    <!-- Menu for mobile -->
    <div class="dropdown dropdown-end sm:hidden">
      <button class="btn btn-ghost">
        <i class="fa-solid fa-bars text-lg"></i>
      </button>

      <ul
        tabindex="0"
        class="dropdown-content menu z-[1] bg-base-200 p-6 rounded-box shadow w-56 gap-2"
      >
        <li><a>About</a></li>
        <li><a>Pricing</a></li>
        <li><a>Blog</a></li>
        <li><a>Contact</a></li>
        <li>
          <select
            class="select select-sm w-full"
            v-model="selectedTheme"
            @change="changeTheme"
          >
            <option v-for="theme in themes" :key="theme" :value="theme">
              {{ theme }}
            </option>
          </select>
        </li>
        <a class="btn btn-sm btn-primary">Log in</a>
      </ul>
    </div>

    <!-- Menu for desktop -->
    <ul class="hidden menu sm:menu-horizontal gap-2 items-center">
      <li><a>About</a></li>
      <li><a>Pricing</a></li>
      <li><a>Blog</a></li>
      <li><a>Contact</a></li>
      <li>
        <select
          class="select select-sm"
          v-model="selectedTheme"
          @change="changeTheme"
        >
          <option v-for="theme in themes" :key="theme" :value="theme">
            {{ theme }}
          </option>
        </select>
      </li>
      <a class="btn btn-sm btn-primary">Log in</a>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const themes = [
  'emerald',
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
]
const selectedTheme = ref('emerald')

const changeTheme = () => {
  document.documentElement.setAttribute('data-theme', selectedTheme.value)
  localStorage.setItem('theme', selectedTheme.value)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved && themes.includes(saved)) {
    selectedTheme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  } else {
    document.documentElement.setAttribute('data-theme', selectedTheme.value)
  }
})
</script>
