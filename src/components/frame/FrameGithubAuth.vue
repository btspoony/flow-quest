<script setup lang="ts">
const github = useGithubProfile();
</script>

<template>
  <slot name="header" />
  <main class="relative container min-h-[calc(100vh-240px)]">
    <div class="hero" v-if="!github.auth">
      <div class="page-container hero-content flex-col">
        <h4>Start Challenges</h4>
        <p>Login with Github to start the challenge tour</p>
        <AuthGithubButton />
      </div>
    </div>
    <template v-else>
      <slot />
    </template>
  </main>
</template>
