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

  <HeadMeta :title="String(route.meta.title ?? 'Home')" :description="description" :url="route.fullPath" />

  <Header />
  <div class="container-fluid">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</Html>
</template>
