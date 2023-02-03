<script setup lang="ts">
import { useNow } from '@vueuse/core';
const props = defineProps<{
  deadline: number
}>()

const now = useNow({ interval: 1000 });

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

const resttime = computed(() =>
  Math.max(0, (props.deadline - now.value.valueOf() / 1000))
);

const days = computed(() => Math.floor(resttime.value / ONE_DAY));
const hours = computed(
  () => Math.floor(resttime.value / ONE_HOUR) - 24 * days.value
);
const min = computed(() => Math.floor((resttime.value % ONE_HOUR) / 60));
const sec = computed(() => Math.floor(resttime.value % 60));
</script>

<template>
  <div class="flex-center !gap-2">
    <span class="mr-3">
      <slot /> remaining:
    </span>
    <template v-if="days > 0">
      <span class="font-bold">{{ days }}</span>
      <span>days</span>
    </template>
    <template v-if="hours > 0">
      <span class="font-bold">{{ hours }}</span>
      <span>hours</span>
    </template>
    <template v-if="min > 0">
      <span class="font-bold">{{ min }}</span>
      <span>minutes</span>
    </template>
    <template v-if="sec > 0">
      <span class="font-bold">{{ sec }}</span>
      <span>seconds</span>
    </template>
  </div>
</template>
