<script setup lang="ts">
const props = defineProps<{
  next: string,
}>();
const router = useRouter();

function onClick() {
  router.push(geneReferralLinkObject(props.next));
}
</script>

<template>
  <button class="!rounded-full px-6 mb-0" @click="onClick()">
    <slot>
      Get Start
    </slot>
  </button>
</template>
