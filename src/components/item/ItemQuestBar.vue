<script setup lang="ts">
const props = defineProps<{
  current: number,
  index: number,
  bounty: BountyInfo
}>()

const questCfg = computed(() => (props.bounty.config as QuestConfig));
const isCurrentProcess = computed(() => props.current === props.index)
const isOdd = computed(() => props.index % 2 === 0)
</script>

<template>
  <div :class="['w-full relative flex gap-0', isOdd ? 'justify-start' : 'justify-end']">
    <div class="relative w-[560px]">
      <div class="absolute w-full" v-if="isCurrentProcess">
        <span class="tag absolute -top-8 left-1/2" style="transform: translateX(-50%);">Next Quest:</span>
      </div>
      <ItemBountyInfoCard :bounty="bounty" :highlight="isCurrentProcess" :locked="(index > current)" />
      <div :class="['card-link absolute right-12 opacity-40 dark:opacity-100', isOdd ? 'left-12' : 'left-auto']" :style="{
        transform: !isOdd ? 'scaleX(-1)' : 'none'
      }" />
    </div>
  </div>
</template>

<style scoped>
.card-link {
  @apply w-64 h-48 max-w-[35vw];
  @apply bg-contain bg-[url(/assets/images/connect-line.png)];
  @apply bg-no-repeat bg-center;
}
</style>
