<script setup lang="ts">
import GithubIcon from '~/assets/svgs/github.svg'

</script>

<template>
  <footer class="w-full h-12 mt-4">
    <div class="h-full container flex-between">
      <small>Copyright © 2022 Flow</small>
      <div class="flex-center gap-2">
        <NuxtLink to="https://github.com/btspoony/flow-challenge-tour" target="_blank" class="secondary">
          <GithubIcon class="fill-current w-6 h-6" />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
