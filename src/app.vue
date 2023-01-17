<script setup lang="ts">
const route = useRoute();
const locale = useLocale();
const isDark = useSharedDark();
const appConfig = useAppConfig();
const isDrawerOpened = useAppDrawerOpened();

useHead({
  titleTemplate: `%s - ${appConfig.title}`,
});

// ----- Data -----
const description = ref(
  "A Flow on-chain quests platform."
);
</script>

<template>
<Html :lang="locale" :data-theme="isDark ? 'dark' : 'light'">
  <noscript>You need to enable JavaScript to run this app.</noscript>

  <HeadMeta :title="String(route.meta.title ?? 'Home')" :description="description" :url="route.fullPath">
    <Link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css" />
  </HeadMeta>

  <div class="drawer drawer-end">
    <input id="page-drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpened" />
    <div class="drawer-content">
      <Header />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Footer />
    </div>
    <div class="drawer-side">
      <label for="page-drawer" class="drawer-overlay"></label>
      <Aside />
    </div>
    </div>
</Html>
</template>

<style>
/* Green Light scheme (Default) */
/* Can be forced with data-theme="light" */
[data-theme="light"],
:root:not([data-theme="dark"]) {
  --primary: #43a047;
  --primary-hover: #388e3c;
  --primary-focus: rgba(67, 160, 71, 0.125);
  --primary-inverse: #FFF;
}

/* Green Dark scheme (Auto) */
/* Automatically enabled if user has Dark mode enabled */
@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --primary: #43a047;
    --primary-hover: #4caf50;
    --primary-focus: rgba(67, 160, 71, 0.25);
    --primary-inverse: #FFF;
  }
}

/* Green Dark scheme (Forced) */
/* Enabled if forced with data-theme="dark" */
[data-theme="dark"] {
  --primary: #43a047;
  --primary-hover: #4caf50;
  --primary-focus: rgba(67, 160, 71, 0.25);
  --primary-inverse: #FFF;
}

/* Green (Common styles) */
:root {
  --form-element-active-border-color: var(--primary);
  --form-element-focus-color: var(--primary-focus);
  --switch-color: var(--primary-inverse);
  --switch-checked-background-color: var(--primary);
}
</style>
