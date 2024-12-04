<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
      <h2 class="text-2xl font-bold text-center">Sign In / Sign Up</h2>
      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="signIn"
          class="w-full py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Sign In
        </button>
        <button
          @click="signUp"
          class="w-full py-3 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-100"
        >
          Sign Up
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
// Page Meta to apply middleware
definePageMeta({
  middleware: "auth",
});

const email = ref<string>("");
const password = ref<string>("");
const supabase = useSupabaseClient();
const router = useRouter(); // Initialize the router

const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    console.error("Sign in error:", error.message);
    alert(error.message);
  } else {
    // Redirect to dashboard after successful sign in
    router.push("/dashboard");
  }
};

const signUp = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  if (error) {
    console.error("Sign up error:", error.message);
    alert(error.message);
  } else {
    alert("Successfully signed up!");
    router.push("/dashboard");
  }
};
</script>

<style scoped>
/* You can add any custom styles here if needed */
</style>
