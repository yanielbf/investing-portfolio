// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  colorMode: {
    preference: 'light',
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@tresjs/nuxt'
  ],
  routeRules: {
    '/**': { ssr: false },
  },
})
