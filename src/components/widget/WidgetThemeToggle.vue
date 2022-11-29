<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";

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
    <SunIcon v-if="isDark" class="fill-current h-6 w-6" />
    <MoonIcon v-else class="stroke-current h-6 w-6" />
  </label>
</template>
