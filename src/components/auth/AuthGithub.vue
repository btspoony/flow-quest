<script setup lang="ts">
import GithubIcon from '~/assets/svgs/github.svg'

const profile = useUserProfile();

onMounted(() => {
  // TODO
});

function login() {
  // TODO
}

function logout() {
  // TODO
}
</script>

<template>
  <div>
    <div v-if="profile.github?.auth" class="inline-flex-between">
      <button class="inline-flex rounded-full" @click="logout">
        Logout
      </button>
    </div>
    <button v-else class="rounded-full inline-flex-between" @click="login">
      <GithubIcon class="fill-current w-5 h-5" />
      <span>Authenticate</span>
    </button>
  </div>
</template>
