export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // If the user is not logged in and trying to access a protected page, redirect to login
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If the user is already logged in and trying to access the login page, redirect to dashboard
  if (user.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
