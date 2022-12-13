<script setup lang="ts">
import type WidgetDialog from '../../widget/WidgetDialog.vue';
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);

const props = defineProps<{
  quest: BountyInfo,
  step: number,
  stepsCfg: QuestStepsConfig[]
  isCompleted: boolean,
  isLocked: boolean,
}>()

const wallet = useFlowAccount();

const submitLoading = ref(false);
const stepCfg = computed(() => props.stepsCfg[props.step]);

const answers = reactive<string[]>([]);

function onOpenDialogue() {
  for (let i = 0; i < stepCfg.value.schema.length; i++) {
    answers[i] = "0xf8d6e0586b0a20c7"
  }
  dialog.value?.openModal()
}

async function onSubmitAnswer() {
  submitLoading.value = true
  const result = await apiPostVerifyQuest(
    props.quest.config,
    props.step,
    stepCfg.value.schema.map((param, index) => {
      return { key: param.key, value: answers[index] }
    })
  )
  console.log(result)
  submitLoading.value = false
}

</script>

<template>
  <div class="card card-border p-4 flex items-center justify-between gap-2">
    <div class="flex-none">
      <span class="rounded-full inline-block w-8 h-8 flex-center bg-gray-200 dark:bg-gray-800">{{ step + 1 }}</span>
    </div>
    <div class="flex-auto text-lg font-semibold">
      {{ stepCfg?.title ?? "" }}
    </div>
    <div class="flex-none min-w-[160px]">
      <template v-if="(!isLocked || isCompleted)">
        <FlowConnectButton v-if="!wallet?.loggedIn" />
        <button v-else-if="!isCompleted" class="mb-0 rounded-full" data-target="modal-dialog"
          @click.prevent="onOpenDialogue">
          <span class="font-semibold">Verify</span>
        </button>
      </template>
    </div>
  </div>
  <WidgetDialog ref="dialog" :locked="submitLoading">
    <div class="flex-center flex-col">
      <h3 class="w-full text-center">Submit your answer</h3>
      <div class="flex flex-col gap-1">
        <template v-for="(param, index) in stepCfg.schema" :key="`key_${index}`">
          <label :for="`param_${param.key}`">
            <span class="text-lg font-semibold">Param[{{ index }}]: {{ param.key }}</span>
            <input type="text" :id="`param_${param.key}`" :name="`param_${param.key}`" :placeholder="param.type"
              v-model="answers[index]" required>
          </label>
        </template>
      </div>
    </div>
    <footer class="mt-4">
      <button class="rounded-xl mb-0" :aria-busy="submitLoading" :disabled="submitLoading"
        @click="onSubmitAnswer()">Submit</button>
    </footer>
  </WidgetDialog>
</template>
