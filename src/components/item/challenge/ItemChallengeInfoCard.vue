<script setup lang="ts">
const props = defineProps<{
  bounty: BountyInfo
}>();

const challengeCfg = computed(() => (props.bounty.config as ChallengeConfig));
const progress = ref(0);
</script>

<template>
  <div class="card card-border double-border h-full w-full flex items-center justify-between gap-4">
    <div class="flex-1 flex flex-col justify-between gap-2 h-full">
      <div>
        <span class="tag">
          {{ challengeCfg.quests.length }} quests
        </span>
      </div>
      <div>
        <strong>{{ challengeCfg.display.name }}</strong>
      </div>
      <div class="w-full">
        <progress :value="progress" max="100" class="mb-0" />
      </div>
    </div>
    <div v-if="props.bounty.config?.display.thumbnail" class="flex-none rounded-xl overflow-hidden">
      <img class="w-28 h-28" :src="getIPFSUrl(props.bounty.config?.display.thumbnail)" alt="Challenge alt">
    </div>
  </div>
</template>
