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
  app: {
    head: {
      link: [
        // Favicons
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "manifest",
          href: "site.webmanifest",
        },
        // CSS
        {
          rel: "stylesheet",
          href: "https://unpkg.com/@picocss/pico@latest/css/pico.min.css",
        },
      ],
    },
  },
  css: ["@/assets/css/pico-customize.css"],
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
