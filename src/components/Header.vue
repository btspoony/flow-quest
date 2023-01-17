<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { Icon } from '@iconify/vue';
import FlowLogo from '~/assets/svgs/flow.svg';

const router = useRouter()

const appConfig = useAppConfig()

const menuHidden = ref(false)

onMounted(() => {
  const { width } = useWindowSize()
  watchEffect(() => {
    menuHidden.value = width.value < 1024
  })
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 min-h-[90px] bg-[var(--background-color)] shadow-sm flex items-center">
    <nav class="container">
      <ul>
        <li class="inline-flex-between !gap-2  cursor-pointer" @click="() => router.push(geneReferralLinkObject('/'))">
          <FlowLogo class="fill-white w-10 h-10" />
          <span class="font-semibold hidden lg:text-lg xl:text-xl lg:inline">{{ appConfig.title }}</span>
        </li>
      </ul>
      <ul>
        <Menus v-if="!menuHidden" />
        <li>
          <WidgetThemeToggle />
        </li>
        <li>
          <AuthHeader />
        </li>
        <li class="cursor-pointer" v-if="menuHidden">
          <label for="page-drawer">
            <Icon icon="heroicons:bars-3" class="w-6 h-6" />
          </label>
        </li>
      </ul>
    </nav>
  </header>
</template>
