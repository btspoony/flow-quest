<script setup lang="ts">
import type WidgetDialog from '../../widget/WidgetDialog.vue';

const props = defineProps<{
  quest: BountyInfo,
  step: number,
  stepsCfg: QuestStepsConfig[]
  isCompleted: boolean,
  isLocked: boolean,
}>()

const current = useFlowAccount();

const stepCfg = computed(() => props.stepsCfg[props.step])
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null)

function onClickTryVerify(event: MouseEvent) {
  dialog.value?.openModal()
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
        <FlowConnectButton v-if="!current?.loggedIn" />
        <button v-else-if="!isCompleted" class="mb-0 rounded-full" data-target="modal-dialog" @click.prevent="onClickTryVerify">
          <span class="font-semibold">Verify</span>
        </button>
      </template>
    </div>
  </div>
  <WidgetDialog ref="dialog">
    <h3>TITLE</h3>
    <footer>
      FOOTER
    </footer>
  </WidgetDialog>
</template>
