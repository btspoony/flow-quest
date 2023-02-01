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
  <article class="card card-border w-32 h-40 !p-0 flex flex-col justify-start">
    <div v-if="pending" class="justify-items-center" aria-busy="true" />
    <a v-else-if="floatEvent" class="h-full flex flex-col justify-between"
      :href="`https://${isTestnet ? 'testnet.' : ''}floats.city/${host}/event/${eventId}`" target="_blank">
      <img class="max-w-[7.9rem] max-h-[7.9rem] self-center rounded-tl-xl rounded-tr-xl" :src="getIPFSUrl(floatEvent.image)"
        :alt="`${floatEvent.name} Image`" />
      <h5 class="flex-grow mb-0 px-1 truncate">{{ floatEvent.name }}</h5>
    </a>
    <div v-else> NaN </div>
  </article>
</template>
