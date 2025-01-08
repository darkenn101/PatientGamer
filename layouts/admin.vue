<template>
  <div class="flex h-screen flex-col">
    <!-- Header -->
    <header class="bg-primary text-white shadow-md">
      <LayoutHeader />
    </header>

    <div class="flex flex-1">
      <!-- Sidebar -->
      <LayoutSidebar />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-base-100 p-6">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <LayoutFooter />
  </div>
</template>

<script setup>
// No specific logic required yet.
</script>

<style>
/* Add custom styles if needed */
</style>
