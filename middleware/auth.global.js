export default defineNuxtRouteMiddleware((to) => {
  console.log()
  if (to?.name === "portfolio" && (!localStorage.getItem('hello') || localStorage.getItem('hello') !== 1234)) {
    return navigateTo("/");
  }
});
