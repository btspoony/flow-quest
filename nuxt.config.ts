import svgLoader from "vite-svg-loader";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // set source dir
  srcDir: "src/",
  // Environment Variables
  runtimeConfig: {
    // The private keys which are only available within server-side
    flowAdminAddress: "",
    flowPrivateKey: "",
    flowPublicKey: "",
    // Keys within public, will be also exposed to the client-side
    public: {
      network: "",
      accessApi: "",
      walletDiscovery: "",
    },
  },
  // ts config
  typescript: {
    shim: false,
  },
  // installed modules
  modules: [
    // Doc: https://github.com/nuxt-community/tailwindcss-module
    "@nuxtjs/tailwindcss",
    // Doc: https://content.nuxtjs.org
    "@nuxt/content",
  ],
  content: {
    // https://content.nuxtjs.org/api/configuration
  },
  build: {
    transpile: ["@heroicons/vue", "@onflow/fcl"],
  },
  css: ["@/assets/css/pico-customize.css"],
  // vite configure
  vite: {
    // raw assets
    assetsInclude: ["**/*.cdc"],
    // plugins
    plugins: [
      svgLoader({
        defaultImport: "component",
      }),
    ],
  },
  nitro: {
    preset: "vercel",
  },
});
