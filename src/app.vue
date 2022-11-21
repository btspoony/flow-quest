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

    <HeadMeta :title="String(route.meta.title ?? 'Home')" :description="description" :url="route.fullPath" />

    </Html>

    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>
