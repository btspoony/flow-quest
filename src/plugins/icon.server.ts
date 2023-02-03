import { _api } from "@iconify/vue";
import fetch from "node-fetch";

export default defineNuxtPlugin((nuxtApp) => {
  _api.setFetch(fetch);
});
