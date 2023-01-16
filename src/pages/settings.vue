<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return refreshActiveSeason(true)
}, {
  server: false
});
</script>

<template>
  <FrameAdmin>
    <WidgetLoadingCard v-if="pending" />
    <div v-else class="w-full flex flex-col items-start gap-4 pt-8">
      <template v-if="data">
        <SectionSettingsCurrent />
        <SectionSettingsBounties />
      </template>
      <SectionSettingsNew v-else />
    </div>
  </FrameAdmin>
</template>
