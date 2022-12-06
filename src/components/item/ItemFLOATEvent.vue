<script setup lang="ts">
const props = defineProps<{
  host: string;
  eventId: string;
}>()
const config = useRuntimeConfig()
const isTestnet = ref(config.public.network !== 'mainnet')

const { data: floatEvent, pending } = useAsyncData<FLOATEvent>('floatEvent', async () => {
  const { $scripts } = useNuxtApp();
  return $scripts.getFLOATDetail(props.host, props.eventId)
}, {
  server: false
});

</script>

<template>
  <article class="card w-24 h-32 flex flex-col items-center justify-center">
    <div v-if="pending" class="justify-items-center" aria-busy="true" />
    <a v-else-if="floatEvent" class="no-style"
      :href="`https://${isTestnet ? 'testnet.' : ''}floats.city/${host}/event/${eventId}`" target="_blank">
      <img class="max-w-[80px] max-h-[80px]" :src="getIPFSUrl(floatEvent.image)" :alt="`${floatEvent.name} Image`" />
      <h3 class="mb-0 flex-grow text-ellipsis overflow-hidden whitespace-nowrap">{{ floatEvent.name }}</h3>
    </a>
    <div v-else> NaN </div>
  </article>
</template>
