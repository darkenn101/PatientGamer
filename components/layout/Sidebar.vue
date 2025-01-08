<template>
  <aside
    class="flex flex-col items-center h-screen sticky top-0 overflow-y-auto space-y-4 w-72 py-6 px-4 bg-base-200"
  >
    <h2 class="font-bold text-lg">User name</h2>

    <span class="text-sm text-accent">username@email.com</span>

    <ul class="menu menu-lg w-full">
      <li>
        <a>
          <i class="fa-solid fa-inbox fa-fw"></i>
          Inbox
        </a>
      </li>
      <li>
        <a class="active">
          <i class="fa-solid fa-user fa-fw"></i>
          Accounts
        </a>
      </li>
      <li>
        <a>
          <i class="fa-solid fa-ticket fa-fw"></i>
          Tickets
        </a>
      </li>
      <li>
        <a>
          <i class="fa-solid fa-gear fa-fw"></i>
          Settings
        </a>
      </li>
    </ul>
  </aside>
</template>

<script setup></script>
