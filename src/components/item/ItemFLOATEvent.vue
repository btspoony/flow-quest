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
  <article class="card card-border w-20 h-28 flex flex-col items-center justify-center">
    <div v-if="pending" class="justify-items-center" aria-busy="true" />
    <a v-else-if="floatEvent" class="flex flex-col items-center justify-center"
      :href="`https://${isTestnet ? 'testnet.' : ''}floats.city/${host}/event/${eventId}`" target="_blank">
      <img class="max-w-[80px] max-h-[80px]" :src="getIPFSUrl(floatEvent.image)" :alt="`${floatEvent.name} Image`" />
      <h5 class="mb-0 flex-grow text-ellipsis overflow-hidden whitespace-nowrap">{{ floatEvent.name }}</h5>
    </a>
    <div v-else> NaN </div>
  </article>
</template>
