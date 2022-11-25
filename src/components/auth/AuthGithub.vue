<script setup lang="ts">
import GithubIcon from '~/assets/svgs/github.svg'

const profile = useUserProfile();
const config = useRuntimeConfig();

onMounted(() => {
  window.addEventListener("message", receiveMessage, false);
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
  };
  const payload = event.data?.payload
  console.log('payload', payload)
}

function login() {
  const url = new URL("/login/oauth/authorize", "https://github.com");
  url.searchParams.set("client_id", config.public.oauthGithubClientId);
  openPopup(url.toString())
}

function logout() {
  // TODO
}
</script>

<template>
  <div>
    <div v-if="profile.github?.auth" class="inline-flex-between">
      TBD
    </div>
    <button v-else class="rounded-full inline-flex-between" @click="login">
      <GithubIcon class="fill-current w-5 h-5" />
      <span>Authenticate</span>
    </button>
  </div>
</template>
