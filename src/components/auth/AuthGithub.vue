<script setup lang="ts">
import { StorageSerializers, RemovableRef, useLocalStorage } from '@vueuse/core';
import GithubIcon from '~/assets/svgs/github.svg'

const profile = useGithubProfile();
let storageToken: RemovableRef<GithubToken>

onMounted(() => {
  window.addEventListener("message", receiveMessage, false);
  storageToken = useLocalStorage<GithubToken>('github-token', null, {
    mergeDefaults: true,
    serializer: StorageSerializers.object
  });

  watchEffect(
    () => {
      if (storageToken.value) {
        profile.value.auth = toRaw(storageToken.value)
      }
    },
    {
      flush: 'sync'
    }
  )
});


onUnmounted(() => {
  window.removeEventListener("message", receiveMessage, false)
})

function receiveMessage(event: any) {
  if (event.origin !== window.location.origin) {
    console.warn(`Message received by ${event.origin}; IGNORED.`);
    return;
  }
  if (event.data?.source !== "auth-popup") {
    return;
  }
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
  const config = useRuntimeConfig();
  const url = new URL("/login/oauth/authorize", "https://github.com");
  url.searchParams.set("client_id", config.public.oauthGithubClientId);
  openPopup(url.toString())
}

</script>

<template>
  <div>
    <div v-if="profile.auth" class="inline-flex-between">
      Github Authenticated
    </div>
    <button v-else class="rounded-full inline-flex-between" @click="login">
      <GithubIcon class="fill-current w-5 h-5" />
      <span>Authenticate</span>
    </button>
  </div>
</template>
