<script setup lang="ts">
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'

const details = ref<HTMLDetailsElement | null>(null);
const profile = useGithubProfile();
const wallet = useFlowAccount();
const user = useUserProfile();

function closeDropdown() {
  details.value?.removeAttribute("open")
}

function onLogout() {
  const { $fcl } = useNuxtApp();
  $fcl.unauthenticate();

  closeDropdown()
  const storageToken = useLocalStorage<GithubToken>('github-token', null, {
    mergeDefaults: true,
    serializer: StorageSerializers.object
  });
  storageToken.value = null
  profile.value.auth = undefined
  profile.value.data = undefined
}
</script>

<template>
  <details ref="details" v-if="profile.data" role="list" dir="rtl">
    <summary aria-haspopup="listbox" role="link" class="inline-flex-between after:!h-10">
      <div class="w-10 h-10">
        <img class="rounded-full" :src="profile.data?.avatarUrl" alt="AvatarUrl" />
      </div>
      <div class="flex items-center gap-2">
        <div class="flex flex-col items-start text-[var(--h3-color)]">
          <span class="font-semibold">{{ profile.data.userName }}</span>
          <span class="text-xs">{{ wallet?.loggedIn && wallet?.addr ? getShortAddress(wallet?.addr) : "No wallet" }} </span>
        </div>
        <div v-if="wallet?.addr" class="tag secondary">
          <template v-if="user?.activeRecord">
            Points: {{ user?.activeRecord?.points ?? 0 }}
          </template>
          <template v-else>
            Need Register
          </template>
        </div>
      </div>
    </summary>
    <ul role="listbox">
      <li v-if="wallet?.loggedIn">
        <NuxtLink :to="`/account/${wallet.addr}`" @click="closeDropdown()">
          <div class="flex gap-4 items-center justify-end">
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
