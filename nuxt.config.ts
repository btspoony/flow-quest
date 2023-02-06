import svgLoader from "vite-svg-loader";
import inject from "@rollup/plugin-inject";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // set source dir
  srcDir: "src/",
  // App Variables
  appConfig: {
    title: "Flow Quest",
    spacesWhitelist:
      process.env.NUXT_PUBLIC_NETWORK === "mainnet"
        ? ["0xa2de93114bae3e73"]
        : ["0xa51d7fe9e0080662"],
  },
  // Environment Variables
  runtimeConfig: {
    // The private keys which are only available within server-side
    flowAdminAddress: "",
    flowKeyAmount: "100",
    flowPrivateKey: "",
    oauthGithubClientSecret: "",
    oauthHost: "",
    // Keys within public, will be also exposed to the client-side
    public: {
      network: "",
      accessApi: "",
      walletDiscovery: "",
      flowServiceAddress: "",
      oauthGithubClientId: "",
      nftStorageToken: "",
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
          href: "/site.webmanifest",
        },
      ],
    },
  },
  // installed modules
  modules: [
    // Doc: https://github.com/nuxt-community/tailwindcss-module
    "@nuxtjs/tailwindcss",
  ],
  build: {
    transpile: [],
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
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    build: {
      rollupOptions: {
        plugins: [inject({ Buffer: ["buffer", "Buffer"] })],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
      },
    },
  },
  nitro: {
    preset: "vercel",
  },
});
