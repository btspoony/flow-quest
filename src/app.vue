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
  <div>
    <Html :lang="locale" :data-theme="isDark ? 'dark' : 'light'">

    <HeadMeta :title="String(route.meta.title ?? 'Home')" :description="description" :url="route.fullPath">
      <!-- Favicons -->
      <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <Link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <Link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <Link rel="manifest" href="/site.webmanifest" />
    </HeadMeta>
    <!-- CSS -->
    <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css" />

    </Html>

    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>
