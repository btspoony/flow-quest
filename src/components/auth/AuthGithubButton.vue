<script setup lang="ts">
import { StorageSerializers, RemovableRef, useLocalStorage } from '@vueuse/core';
import GithubIcon from '~/assets/svgs/github.svg'

const profile = useGithubProfile();
const loading = ref(false)
let storageToken: RemovableRef<GithubToken>

defineExpose({
  loading
})

onMounted(() => {
  window.addEventListener("message", receiveMessage, false);

  storageToken = useLocalStorage<GithubToken>('github-token', null, {
    mergeDefaults: true,
    serializer: StorageSerializers.object
  });

  watchEffect(() => {
    if (storageToken.value) {
      profile.value.auth = toRaw(storageToken.value)
    } else {
      profile.value.auth = undefined
    }
  })
})

onUnmounted(() => {
  window.removeEventListener("message", receiveMessage, false)
})

function receiveMessage(event: any) {
  if (event.origin !== window.location.origin) {
    console.info(`Message received by ${event.origin}; IGNORED.`);
    return;
  }
  if (event.data?.source !== "auth-popup") {
    return;
  }
  loading.value = false

  const payload = event.data?.payload ?? {}
  console.log('Payload: ', payload)

  if (typeof payload.error === 'string') {
    // NOTHING
  } else if (typeof payload.access_token === 'string') {
    storageToken.value = {
      tokenType: payload.token_type,
      scope: payload.scope,
      accessToken: payload.access_token
    }
  }
}

function login() {
  loading.value = true

  const config = useRuntimeConfig();
  const url = new URL("/login/oauth/authorize", "https://github.com");
  url.searchParams.set("client_id", config.public.oauthGithubClientId);
  openPopup(url.toString())
}
</script>

<template>
  <button :aria-busy="loading" class="flex-center rounded-full max-w-[10rem]" @click="login">
    <div class="inline-flex-around">
      <GithubIcon v-if="!loading" class="fill-current w-5 h-5" />
      <span v-if="loading" />
      <span>Participate</span>
    </div>
  </button>
</template>
