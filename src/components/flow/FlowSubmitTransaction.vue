
<script setup lang="ts">
import type { TransactionReceipt } from "@onflow/fcl";

const props = withDefaults(
  defineProps<{
    method: () => Promise<string | null>;
    content?: string;
  }>(),
  {
    content: "Submit",
  }
);

const emit = defineEmits<{
  (e: "sealed", tx: TransactionReceipt): void;
  (e: "error", message: string): void;
}>();

// expose members
defineExpose({
  resetComponent: ref(resetComponent),
});

const txid = ref<string | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const isSealed = ref(false);

async function startTransaction() {
  if (isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = null;
  isSealed.value = false;
  try {
    txid.value = await props.method();
  } catch (err: any) {
    console.error(err);
    const msg = String(err.reason ?? err.message ?? "rejected");
    errorMessage.value = msg.length > 60 ? msg.slice(0, 60) + "..." : msg;
    emit("error", errorMessage.value);
  }
  isLoading.value = false;
}

function onSealed(tx: TransactionReceipt) {
  isSealed.value = true;
  emit("sealed", tx);
}

function onError(msg: string) {
  errorMessage.value = msg
  emit("error", msg);
}

function resetComponent() {
  txid.value = null;
  errorMessage.value = null;
  isSealed.value = false;
}

</script>

<template>
  <div class="flex flex-col gap-2">
    <button v-if="!txid" class="rounded-xl" role="button" :aria-busy="isLoading" :disabled="isLoading" aria-disabled="true"
      @click="startTransaction">
      <slot>
        {{ content }}
      </slot>
    </button>
    <FlowWaitTransaction v-else :txid="txid" @sealed="onSealed" @error="onError" />
    <p v-if="errorMessage" class="px-4 mb-0 text-xs text-error w-full">
      {{ errorMessage }}
    </p>
    <slot v-if="isSealed" name="next">
      <button class="rounded-xl text-sm" role="button" aria-disabled="true" @click="resetComponent">Close</button>
    </slot>
  </div>
</template>
