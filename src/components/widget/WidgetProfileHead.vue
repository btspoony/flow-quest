<script setup lang="ts">
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const details = ref<HTMLDetailsElement | null>(null);

const appConfig = useAppConfig();
const github = useGithubProfile();
const linkedAddress = useLinkedWalletAddress();
const wallet = useFlowAccount();
const user = useUserProfile();
const isRegistering = useUserProfileInitializing();
const isLoadingUser = useUserProfileLoading();

// load platform info
watchEffect(async () => {
  if (github.value) {
    const { $scripts } = useNuxtApp()
    linkedAddress.value = await $scripts.getPlatformLinkedAddress('github', String(github.value.data?.id))
  } else {
    linkedAddress.value = null
  }
})

// load user profile
watch(wallet, async (newVal, oldVal) => {
  if (newVal?.loggedIn && (newVal.addr === linkedAddress.value || !linkedAddress.value)) {
    user.value = await reloadCurrentUser({}, { adminStatus: true });
  } else {
    user.value = null
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
const isInSpacePageWhiteList = computed(() => {
  return !user.value?.address
    ? false
    : appConfig.spacesWhitelist.indexOf(user.value.address) > -1
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
        <div v-if="wallet?.addr" class="tag secondary" :aria-busy="isMatchedWallet && (isRegistering||isLoadingUser)">
          <template v-if="isMatchedWallet && user?.profileRecord">
            {{ user?.profileRecord?.points ?? 0 }} Points
          </template>
          <template v-else>
            {{ isMatchedWallet ? (isRegistering ? ' Initializing' : ' Loading Profile') : 'Wrong Wallet' }}
          </template>
        </div>
      </div>
    </summary>
    <ul role="listbox">
      <template v-if="wallet?.loggedIn">
      <li>
        <NuxtLink :to="geneReferralLink(`/account/${linkedAddressString}`)" @click="closeDropdown()">
          <div class="flex gap-4 items-center justify-end">
            <span>Profile</span>
            <Icon icon="heroicons:user-circle-solid" class="text-secondary w-5 h-5" inline />
          </div>
        </NuxtLink>
      </li>
      <li v-if="isInSpacePageWhiteList">
        <NuxtLink :to="geneReferralLink(`/spaces`)" @click="closeDropdown()">
          <div class="flex gap-4 items-center justify-end">
            <span>Spaces</span>
            <Icon icon="heroicons:rectangle-stack-solid" class="w-5 h-5" />
          </div>
        </NuxtLink>
      </li>
      <li v-if="user?.adminStatus?.valid">
        <NuxtLink :to="geneReferralLink(`/settings`)" @click="closeDropdown()">
          <div class="flex gap-4 items-center justify-end">
            <span>Service Setting</span>
            <Icon icon="heroicons:cog-6-tooth-solid" class="w-5 h-5" />
          </div>
        </NuxtLink>
      </li>
      </template>
      <li>
        <a class="cursor-pointer" @click="onLogout()">
          <div class="flex gap-4 items-center justify-end">
            <span>Logout</span>
            <Icon icon="heroicons:arrow-right-on-rectangle-solid" class="w-5 h-5" />
          </div>
        </a>
      </li>
    </ul>
  </details>
</template>
