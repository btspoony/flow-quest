<script setup lang="ts">
import { StorageSerializers, RemovableRef, useLocalStorage } from '@vueuse/core';
import { ChevronRightIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'

const profile = useGithubProfile();
let storageToken: RemovableRef<GithubToken>

onMounted(() => {
  storageToken = useLocalStorage<GithubToken>('github-token', null, {
    mergeDefaults: true,
    serializer: StorageSerializers.object
  });
})

function onLogout() {
  storageToken.value = null
  profile.value.auth = undefined
  profile.value.data = undefined
}
</script>

<template>
  <details v-if="profile.data" role="list" dir="rtl">
    <summary aria-haspopup="listbox" role="link" class="after:!h-10">
      <div class="w-10 h-10">
        <img class="rounded-full" :src="profile.data?.avatarUrl" alt="AvatarUrl" />
      </div>
    </summary>
    <ul role="listbox">
      <li>
        <NuxtLink to="/account/profile">
          <div class="flex gap-4 items-center justify-between">
            <ChevronRightIcon class="fill-current w-5 h-5" />
            <span>Profile</span>
            <UserCircleIcon class="fill-secondary w-5 h-5" />
          </div>
        </NuxtLink>
      </li>
      <li>
        <a class="cursor-pointer" @click="onLogout()">
          <div class="flex gap-4 items-center justify-end">
            <span>Logout</span>
            <ArrowRightOnRectangleIcon class="fill-current w-5 h-5" />
          </div>
        </a>
      </li>
    </ul>
  </details>
</template>
