<script setup lang="ts">
const route = useRoute();
const locale = useLocale();
const isDark = useSharedDark();

useHead({
  titleTemplate: "%s - Flow Developer Challenges",
});

// ----- Data -----
const description = ref(
  "A Flow developer competition platform."
);
</script>

<template>
<Html :lang="locale" :data-theme="isDark ? 'dark' : 'light'">

  <HeadMeta :title="String(route.meta.title ?? 'Home')" :description="description" :url="route.fullPath">
    <Link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css" />
  </HeadMeta>

  <Header />
  <div class="container">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
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
