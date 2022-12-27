<script setup lang="ts">
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'

const details = ref<HTMLDetailsElement | null>(null);
const github = useGithubProfile();
const linkedAddress = useLinkedWalletAddress();
const wallet = useFlowAccount();
const user = useUserProfile();

// load user profile
watch(wallet, async (newVal, oldVal) => {
  if (newVal?.loggedIn && newVal.addr === linkedAddress.value || !linkedAddress.value) {
    user.value = await apiGetCurrentUser()
  } else {
    user.value = null
  }
})

// load platform info
watchEffect(async () => {
  if (github.value) {
    const { $scripts } = useNuxtApp()
    linkedAddress.value = await $scripts.getPlatformLinkedAddress('github', String(github.value.data?.id))
  } else {
    linkedAddress.value = null
  }
})

const isMatchedWallet = computed(() => {
  return !linkedAddress.value || linkedAddress.value === wallet.value?.addr
})
const linkedAddressShortString = computed(() => {
  return linkedAddress.value
    ? getShortAddress(linkedAddress.value)
    : wallet.value?.loggedIn && wallet.value?.addr ? getShortAddress(wallet.value?.addr) : "No wallet"
})
const linkedAddressString = computed(() => {
  return linkedAddress.value ?? (wallet.value?.loggedIn ? wallet.value?.addr : "No wallet")
})

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
  github.value.auth = undefined
  github.value.data = undefined
}
</script>

<template>
  <details ref="details" v-if="github.data" role="list" dir="rtl">
    <summary aria-haspopup="listbox" role="link" class="inline-flex-between after:!h-10">
      <div class="w-10 h-10">
        <img class="rounded-full" :src="github.data?.avatarUrl" alt="AvatarUrl" />
      </div>
      <div class="flex items-center gap-2">
        <div class="flex flex-col items-start text-[var(--h3-color)]">
          <span class="font-semibold">{{ github.data.userName }}</span>
          <span class="text-xs">{{ linkedAddressShortString }} </span>
        </div>
        <div v-if="wallet?.addr" class="tag secondary">
          <template v-if="isMatchedWallet && user?.activeRecord">
            {{ user?.activeRecord?.points ?? 0 }} Points
          </template>
          <template v-else-if="isMatchedWallet">
            Need Register
          </template>
          <template v-else>
            Wrong Wallet
          </template>
        </div>
      </div>
    </summary>
    <ul role="listbox">
      <li v-if="wallet?.loggedIn">
        <NuxtLink :to="geneReferralLink(`/account/${linkedAddressString}`)" @click="closeDropdown()">
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
