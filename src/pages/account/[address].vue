<script setup lang="ts">
definePageMeta({
  key: route => route.path
})

const route = useRoute()
const user = useUserProfile()
const currentProfile = useCurrentProfile()

const profileAddr = computed<string>(() => route.params.address as string)

const { data: profile, pending } = useAsyncData<ProfileData | null>(`user:${profileAddr}`, async () => {
  await apiGetActiveSeason()
  let profile: ProfileData | null
  if (user.value?.address === profileAddr.value) {
    profile = user.value
  } else {
    profile = await loadUserProfile(profileAddr.value)
  }
  currentProfile.value = profile
  return profile
}, {
  server: false
})

const profileIdentity = computed<ProfileIdentity | null>(() => {
  const identities = profile.value?.linkedIdentities
  if (identities !== undefined) {
    for (const platform in identities) {
      return identities[platform]
    }
  }
  return null
})
</script>

<template>
  <FrameMain :no-topbar="true" ref="frame">
    <template v-slot:header>
      <div class="h-8"></div>
      <div class="w-full h-56 relative overflow-hidden -z-50">
        <div class="profile-header bg-[url(/assets/images/profile-bg.jpg)]"></div>
        <div class="absolute inset-0 bg-black/50" />
      </div>
    </template>
    <div class="relative max-w-3xl mx-auto -mt-32">
      <div v-if="pending" :aria-busy="true"></div>
      <template v-else-if="profileIdentity">
        <section class="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
          <div class="flex-none">
            <div class="rounded-full bg-highlight w-40 h-40 flex-center shadow-xl">
              <div class="rounded-full bg-white w-[9.5rem] h-[9.5rem] flex-center">
                <img :src="getIPFSUrl(profileIdentity.display.thumbnail!)" class="rounded-full w-[9rem] h-[9rem]" />
              </div>
            </div>
          </div>
          <div class="flex-auto py-2 md:py-8 flex flex-col gap-1">
            <div
              class="flex-between pb-2 border-solid border-x-0 border-t-0 border-b-1 profile-text">
              <span class="text-5xl font-black bg-clip-text text-transparent bg-secondary uppercase">
                {{ profileIdentity.display.name }}
              </span>
              <span class="px-3 py-1 rounded-full font-semibold border border-solid bg-gray-300/20 profile-text">
                {{ profileAddr }}
              </span>
            </div>
            <div class="flex-between profile-text">
              {{ profileIdentity.display.description }}
            </div>
          </div>
        </section>
        <section class="mb-0 flex flex-col gap-8">
          <nav>
            <ul class="flex gap-2">
              <li><a href="#" class="tab-link active">Current Season</a></li>
              <li><span class="tab-link disabled">Achievements</span></li>
            </ul>
          </nav>
          <NuxtPage />
        </section>
      </template>
    </div>
  </FrameMain>
</template>

<style scoped>
.profile-header {
  @apply w-full h-full absolute;
  @apply bg-cover bg-center;
}

.profile-text {
  @apply border-gray-600 md:border-white dark:border-white;
  @apply text-gray-600 md:text-white dark:text-white;
}
</style>
