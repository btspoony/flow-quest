<script setup lang="ts">
import { StorageSerializers, RemovableRef, useLocalStorage } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const loading = ref(false)
const profile = useGithubProfile();
let storageToken: RemovableRef<GithubToken>

onMounted(() => {
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
  window.removeEventListener("message", receiveMessage, false)
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
  window.addEventListener("message", receiveMessage, false);

  const config = useRuntimeConfig();
  const url = new URL("/login/oauth/authorize", "https://github.com");
  url.searchParams.set("client_id", config.public.oauthGithubClientId);
  openPopup(url.toString())
}
</script>

<template>
  <button :aria-busy="loading" class="flex-center rounded-full min-w-[10rem] mb-0" @click="login">
    <div class="inline-flex-around">
      <Icon icon="uil:github" v-if="!loading" class="w-5 h-5" />
      <span v-if="loading" />
      <span>Participate</span>
    </div>
  </button>
</template>
