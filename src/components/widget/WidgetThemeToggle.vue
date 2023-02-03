<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { Icon } from '@iconify/vue';

const isDark = useDark({
  attribute: "data-theme"
});

const isSharedDark = useSharedDark();
watchEffect(
  () => {
    isSharedDark.value = isDark.value;
  },
  { flush: "sync" }
);

const toggleDark = useToggle(isDark);
</script>

<template>
  <label class="cursor-pointer focus:outline-none" @click="toggleDark()">
    <span class="sr-only">View ThemeToggle: {{ isDark ? "dark" : "light" }}</span>
    <Icon icon="heroicons:sun-solid" v-if="isDark" class="h-6 w-6" />
    <Icon icon="heroicons:moon" v-else class="h-6 w-6" />
  </label>
</template>
