<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean
}>(), {
  noTopbar: false
});
const user = useUserProfile()
const spacesUpdated = useSpacesUpdated()

const { data: list, pending, refresh } = useAsyncData<Array<CommunitySpaceBasics | null>>(`spaces:${user.value?.address ?? 'unknown'}`, async () => {
  let result: Array<CommunitySpaceBasics | null> = [];
  if (typeof user.value?.address === 'string' && user.value?.adminStatus?.valid) {
    const { $scripts } = useNuxtApp()
    const res = await $scripts.spaceGetList(user.value.address)
    if (res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        result.push(res[i])
      }
    }
    result.push(null)
  }
  return result
}, {
  server: false,
  lazy: true,
})

watch(user, async (newVal) => {
  refresh()
})
watch(spacesUpdated, (newVal) => {
  if (spacesUpdated.value) {
    refresh()
    spacesUpdated.value = false
  }
})

function sendClaimAdminResource(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.adminInitialize()
}
</script>

<template>
  <div v-if="!noTopbar" class="h-[90px]"></div>
  <div class="container min-h-[calc(100vh-180px)] flex gap-4 w-full">
    <div v-if="!user?.adminStatus?.valid || !user?.adminStatus?.enabled" class="hero">
      <div class="hero-content flex-col text-center">
        <span v-if="!user?.adminStatus?.valid">Cannot access to the admin page</span>
        <template v-else-if="!user?.adminStatus?.enabled">
          <div class="headings mb-2">
            <h3>Initialize Admin</h3>
            <p>Claim an admin resource to manage content.</p>
          </div>
          <FlowSubmitTransaction :method="sendClaimAdminResource"
            @success="reloadCurrentUser({ignoreIdentities: true, ignoreSeason: true})">
            <span class="px-12">Claim</span>
          </FlowSubmitTransaction>
        </template>
      </div>
    </div>
    <template v-else>
      <aside class="flex-none aside border-gray-300 dark:border-gray-700">
        <div v-if="pending" :aria-busy="true" />
        <template v-else>
          <ItemSpaceIcon v-for="one in list" :key="one ? one.id : 'create'" :space="one" />
        </template>
      </aside>
      <main class="flex-auto w-full">
        <div class="relative mx-auto max-w-2xl">
          <slot />
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.aside {
  @apply h-[calc(100vh-180px)] w-14 pt-4;
  @apply flex flex-col items-center justify-start gap-2;
  @apply border-y-0 border-l-0 border-r border-solid;
}
</style>
