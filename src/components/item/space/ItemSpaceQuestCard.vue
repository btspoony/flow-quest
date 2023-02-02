<script setup lang="ts">
import md from 'markdown-it';
import type WidgetDialog from '../../widget/WidgetDialog.vue';

const props = defineProps<{
  quest: QuestConfig
}>();

const emit = defineEmits<{
  (e: 'dataUpdated'): void
}>()

const mdRenderer = md()
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);
const submitLoading = ref(false);

const floatData = ref<FLOATBasics | null>(null)

const isSubmitValid = computed(() => {
  return !!floatData.value?.name && !!floatData.value?.image
})

async function onSubmit(): Promise<string | null> {
  if (!isSubmitValid.value || !floatData.value) return null;

  submitLoading.value = true
  const { $transactions } = useNuxtApp()

  return $transactions.spaceApplyFLOATinQuest(floatData.value, props.quest.communityId, props.quest.key)
}

function onOpenDialogue() {
  floatData.value = {
    name: '',
    description: '',
    image: '',
    url: ''
  }
  dialog.value?.openModal()
}

function onCloseDialgue() {
  emit('dataUpdated')
  floatData.value = null
  dialog.value?.closeModal()
}

function resetComp() {
  submitLoading.value = false
}
</script>

<template>
  <div class="card card-border non-interactive p-4">
    <span class="tag">{{ quest.key }}</span>
    <details class="mt-4 mb-0 border-b-0">
      <summary>
        <div class="w-[80%] inline-flex items-center justify-between">
          <span><b>Title: </b>{{ quest.display.name }}</span>
          <span><b>Mission Amount: </b>{{ quest.missions.length }}</span>
        </div>
      </summary>
      <div class="flex flex-col gap-2">
        <h6 class="mb-1">Description: </h6>
        <div class="prose-sm prose-blockquote:py-0 prose-img:my-0" v-html="mdRenderer.render(quest.display.description)"></div>
        <div>
          <h6 class="mb-1">Missions: </h6>
          <div class="flex flex-wrap gap-4 basis-1/2 md:basis-1/3 lg:basis-1/4 ">
            <span v-for="one in quest.missions" :key="one.key" class="tag">{{ one.key }}</span>
          </div>
        </div>
        <div>
          <h6 class="mb-2">Achievement FLOAT: </h6>
          <ItemFLOATEvent v-if="quest.achievement" :host="quest.achievement.host" :event-id="quest.achievement.eventId" />
          <div v-else>
            <button class="rounded-full flex-center px-6 mb-0" data-target="modal-dialog" @click.stop.prevent="onOpenDialogue">
              Create an achievement FLOAT
            </button>
          </div>
        </div>
      </div>
    </details>
  </div>
  <WidgetDialog ref="dialog" :locked="submitLoading">
    <form v-if="floatData" class="mb-0">
      <label for="floatName">
        Name
        <input type="text" id="floatName" placeholder="Name" v-model.trim="floatData.name" required />
      </label>
      <label for="floatDesc">
        Description
        <textarea id="floatDesc" placeholder="Description" class="resize-y h-28 max-h-60"
          v-model.trim="floatData.description" required />
      </label>
      <label for="floatURL">
        URL
        <input type="url" id="floatURL" placeholder="https://..." v-model.trim="floatData.url" required />
      </label>
      <WidgetUploader @ipfs-added="(cid) => { if (floatData) { floatData.image = cid } }">
        <template v-slot:preview>
          <img v-if="floatData.image" :src="getIPFSUrl(floatData.image)" class="max-w-[12rem] max-h-[12rem]"
            alt="Image Preview" />
        </template>
      </WidgetUploader>
    </form>
    <footer class="mt-4">
      <FlowSubmitTransaction :disabled="!isSubmitValid" :method="onSubmit" @sealed="resetComp()" @error="resetComp()"
        @reset="onCloseDialgue()">
        Submit
        <template v-slot:disabled>
          Missing Parameters
        </template>
      </FlowSubmitTransaction>
    </footer>
  </WidgetDialog>
</template>
