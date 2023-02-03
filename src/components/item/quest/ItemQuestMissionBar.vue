<script setup lang="ts">
const props = withDefaults(defineProps<{
  bounty: BountyInfo;
  current: number;
  index: number;
  isLast?: boolean;
  locked?: boolean;
}>(), {
  isLast: false,
  locked: false
})

const isCurrentProcess = computed(() => props.current === props.index)
const isOdd = computed(() => props.index % 2 === 0)
const isLocked = computed(() => props.locked || props.index > props.current)
</script>

<template>
  <div :class="['first:mt-12 w-full relative flex gap-0', isOdd ? 'justify-start' : 'justify-end']">
    <div class="relative w-[560px]">
      <div class="absolute w-full" v-if="isCurrentProcess">
        <span class="tag tag-sm absolute -top-9 left-1/2" style="transform: translateX(-50%);">Next Mission:</span>
      </div>
      <ItemBountyInfoCard :bounty="bounty" :highlight="isCurrentProcess && !isLocked" :locked="isLocked" />
      <div v-if="!isLast"
        :class="['card-link absolute right-12 opacity-40 dark:opacity-100', isOdd ? 'left-12' : 'left-auto']" :style="{
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
