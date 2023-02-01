<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return refreshActiveSeason(true)
}, {
  server: false
});

const route = useRoute()

const currentTab = ref(route.query.tab === 'bounties' ? 'bounties' : 'seasons')
const tabs = [
  { label: "seasons" },
  { label: "bounties" },
]

watch(() => route.query, (newQuery) => {
  if (newQuery.tab === 'bounties') {
    currentTab.value = 'bounties'
  } else {
    currentTab.value = 'seasons'
  }
})

function updateRoute(name: string) {
  const router = useRouter()
  router.replace({ path: route.path, query: { tab: name } })
}
</script>

<template>
  <FrameAdmin>
    <WidgetLoadingCard v-if="pending" />
    <template v-else>
      <nav class="py-4">
        <ul class="tabs">
          <li v-for="tab in tabs" :key="tab.label" :class="['tab-link', { 'active': currentTab === tab.label }]"
            @click="updateRoute(tab.label)">
            {{ tab.label }}
          </li>
        </ul>
      </nav>
      <SectionSettingsBounties v-if="currentTab === 'bounties'" />
      <div v-else-if="currentTab === 'seasons'" class="w-full flex items-start gap-4">
        <SectionSettingsCurrent v-if="data?.seasonId" />
        <SectionSettingsNew v-else />
      </div>
    </template>
  </FrameAdmin>
</template>
