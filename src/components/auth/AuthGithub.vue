<script setup lang="ts">
import { StorageSerializers, RemovableRef, useLocalStorage } from '@vueuse/core';
import GithubIcon from '~/assets/svgs/github.svg'

const profile = useGithubProfile();
const loading = ref(false);
let storageToken: RemovableRef<GithubToken>

onMounted(() => {
  window.addEventListener("message", receiveMessage, false);
  storageToken = useLocalStorage<GithubToken>('github-token', null, {
    mergeDefaults: true,
    serializer: StorageSerializers.object
  });

  watchEffect(
    async () => {
      if (storageToken.value) {
        profile.value.auth = toRaw(storageToken.value)

        loading.value = true
        const data: any = await $fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${storageToken.value.accessToken}`
          }
        })
        if (typeof data === 'object') {
          profile.value.data = {
            id: data.id,
            userName: data.login,
            displayName: data.name,
            avatarUrl: data.avatar_url,
            email: data.email,
            bio: data.bio,
            location: data.location,
            public_repos: data.public_repos,
            public_gists: data.public_gists,
            followers: data.followers,
            following: data.following,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at)
          }
        }
        loading.value = false
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
      <span v-if="!profile.data || loading" :aria-busy="loading">
        Loading
      </span>
      <div v-else class="w-10 h-10">
        <img class="rounded-full" :src="profile.data?.avatarUrl" alt="AvatarUrl" />
      </div>
    </div>
    <button v-else :aria-busy="loading" class="rounded-full inline-flex-between" @click="login">
      <GithubIcon class="fill-current w-5 h-5" />
      <span>Authenticate</span>
    </button>
  </div>
</template>
