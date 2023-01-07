<script setup lang="ts">
import { ArrowUturnLeftIcon } from '@heroicons/vue/24/solid'

function back() {
  window.history.back()
}
</script>

<template>
  <a href="#" role="button" class="secondary outline rounded-full w-12 h-12 inline-flex-center" @click="back">
    <ArrowUturnLeftIcon class="fill-current w-5 h-5" />
  </a>
</template>
