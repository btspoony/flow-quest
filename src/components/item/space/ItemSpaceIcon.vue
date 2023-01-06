<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  space: CommunitySpaceBasics | null
}>()

const emit = defineEmits<{
  (e: 'select', key: string, owner: string, id: string): void,
  (e: 'create'): void,
}>()

const currentSpace = useCurrentSpace()
const router = useRouter()
const route = useRoute()

const isCurrentActive = computed(() => {
  return props.space
    ? props.space?.id === currentSpace.value?.id
    : route.path === "/spaces/create"
})

function onSelectCurrent() {
  if (!props.space) {
    currentSpace.value = null
    if (route.path !== '/spaces/create') {
      router.push(geneReferralLinkObject('/spaces/create'))
    }
  } else {
    currentSpace.value = props.space
    if (route.params.key !== props.space?.key) {
      router.push(geneReferralLinkObject(`/spaces/${props.space?.key}`))
    }
  }
}
</script>

<template>
  <div :class="['group cursor-pointer w-14 px-2 relative flex items-center', isCurrentActive ? 'active' : '']"
    @click="onSelectCurrent">
    <div
      class="absolute right-0 h-2 w-1 rounded-full transition-all duration-300 group-hover:bg-current group-[.active]:bg-current group-[.active]:h-4" />
    <div
      :class="['flex-center rounded-full w-10 h-10 border hover:border-solid hover:shadow-md', space ? '' :'border-solid border-current']">
      <template v-if="space">
        <img :src="getIPFSUrl(space?.display.imageUrl!)" class="rounded-full w-10 h-10" />
      </template>
      <PlusIcon v-else class="fill-current w-6 h-6" />
    </div>
  </div>
</template>
