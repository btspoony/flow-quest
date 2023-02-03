<script setup lang="ts">
const props = withDefaults(defineProps<{
  host: string;
  eventId: string;
  small?: boolean;
}>(), {
  small: false
})
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
  <article
    :class="['card card-border !p-0 flex flex-col justify-start', small ? '!rounded-md w-16 h-20' : '!rounded-xl w-32 h-40']">
    <div v-if="pending" class="justify-items-center" aria-busy="true" />
    <a v-else-if="floatEvent" class="h-full flex flex-col justify-between"
      :href="`https://${isTestnet ? 'testnet.' : ''}floats.city/${host}/event/${eventId}`" target="_blank">
      <img
        :class="['self-center', small? 'max-w-[3.9rem] max-h-[3.9rem] rounded-t-md' :'max-w-[7.9rem] max-h-[7.9rem] rounded-t-xl']"
        :src="getIPFSUrl(floatEvent.image)"
        :alt="`${floatEvent.name} Image`" />
      <span :class="['flex-grow px-1 truncate', small ? 'text-xs' : 'text-lg font-semibold']">{{ floatEvent.name }}</span>
    </a>
    <div v-else> NaN </div>
  </article>
</template>
