
<script setup lang="ts">
import type { TransactionReceipt } from "@onflow/fcl";

const props = withDefaults(
  defineProps<{
    method: () => Promise<string | null>;
    content?: string;
    action?: string;
    disabled?: boolean;
    hideButton?: boolean
    hideTrx?: boolean
  }>(),
  {
    content: "Submit",
    action: '',
    disabled: false,
    hideButton: false,
    hideTrx: false,
  }
);

const emit = defineEmits<{
  (e: "sealed", tx: TransactionReceipt): void;
  (e: 'success'): void;
  (e: "error", message: string): void;
  (e: "reset"): void;
}>();

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
    isSealed.value = true;
    console.error(err);
    const msg = String(err.reason ?? err.message ?? "rejected");
    errorMessage.value = msg.length > 60 ? msg.slice(0, 60) + "..." : msg;
    emit("error", errorMessage.value);
  }
  isLoading.value = false;
}

function onSealed(tx: TransactionReceipt) {
  isSealed.value = true;
  if (!tx.errorMessage) {
    emit("success")
  }
  emit("sealed", tx);
}

function onError(msg: string) {
  errorMessage.value = msg
  emit("error", msg);
}

function resetComponent() {
  emit("reset")
  txid.value = null;
  errorMessage.value = null;
  isSealed.value = false;
}

// expose members
defineExpose({
  resetComponent: ref(resetComponent),
  startTransaction: ref(startTransaction),
  isLoading,
  isSealed
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <button v-if="disabled && !txid" class="rounded-xl flex-center mb-0" disabled>
      <slot name="disabled">
        Disabled
      </slot>
    </button>
    <button v-else-if="!hideButton && !txid" class="rounded-xl flex-center mb-0" role="button" :aria-busy="isLoading"
      :disabled="isLoading" :aria-disabled="isLoading"
      @click="startTransaction">
      <slot>
        {{ content }}
      </slot>
    </button>
    <FlowWaitTransaction v-if="txid" :hidden="hideTrx" :txid="txid" @sealed="onSealed" @error="onError">
      <template v-if="action != ''">
        <h5 class="mb-0">{{ action }}</h5>
      </template>
    </FlowWaitTransaction>
    <p v-if="!hideTrx && errorMessage" class="w-full px-4 mb-0 text-xs text-failure">
      {{ errorMessage }}
    </p>
    <slot v-if="!hideTrx && txid && isSealed" name="next">
      <button class="mx-0 rounded-xl text-sm" role="button" @click.stop.prevent="resetComponent">Close</button>
    </slot>
  </div>
</template>
