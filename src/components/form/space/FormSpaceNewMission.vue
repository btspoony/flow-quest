<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const injected = inject(spaceNewMissionsInjectKey, [])

const cfgPreview = ref("")
const isStepsCfgURLValid = ref(false)
const stepsCfgLoading = ref(false)
const cfgGuideURL = ref("")

defineExpose({
  resetForm: ref(resetForm),
})

function resetForm() {
  cfgPreview.value = ""
  isStepsCfgURLValid.value = false
  stepsCfgLoading.value = false
  cfgGuideURL.value = ""
}

watch([isStepsCfgURLValid], ([newStepsValidA]) => {
  const data = injected[props.index]
  if (
    data
    && data.key
    && data.key !== 'create-mission'
    && data.key !== 'create-quest'
    && data.name
    && data.description
    && newStepsValidA
  ) {
    injected[props.index].valid = true
  } else {
    injected[props.index].valid = false
  }
})

async function loadAndValidateCfg() {
  let valid = false
  try {
    stepsCfgLoading.value = true
    const cfgJson = await $fetch(injected[props.index].stepsCfg)
    stepsCfgLoading.value = false
    const cfg = JSON.parse(cfgJson as string)
    cfgGuideURL.value = typeof cfg.guide === 'string' ? cfg.guide : ""
    const stepsJson: any[] = Array.isArray(cfg) ? cfg : Array.isArray(cfg.steps) ? cfg.steps : []
    if (stepsJson.length > 0) {
      valid = stepsJson.filter(one => {
        const stepCfg = one as MissionStepsConfig
        return typeof stepCfg.type === 'string'
          && typeof stepCfg.title === 'string'
          && (stepCfg.type === 'onchain' ? typeof stepCfg.code === 'string' && Array.isArray(stepCfg.schema) : Array.isArray(stepCfg.quiz))
      }).length === stepsJson.length

      if (valid) {
        injected[props.index].steps = stepsJson.length
        cfgPreview.value = JSON.stringify(cfg, null, '\t')
      } else {
        cfgPreview.value = "Invalid JSON."
      }
    }
  } catch (e) {
    cfgPreview.value = "Unknown"
  }
  isStepsCfgURLValid.value = valid
}

</script>

<template>
  <form class="mb-0" v-if="injected[index]">
    <label for="missionKey">
      Key
      <input type="text" id="missionKey" placeholder="Unique Key" v-model.trim="injected[index].key" required />
    </label>
    <label for="missionTitle">
      Title
      <input type="text" id="missionTitle" placeholder="Title" v-model.trim="injected[index].name" required />
    </label>
    <label for="missionDesc">
      Description
      <textarea id="missionDesc" placeholder="Description" class="resize-y h-28 max-h-60"
        v-model.trim="injected[index].description" required />
    </label>
    <div class="grid mb-2">
      <label for="missionStepsCfg">
        URL of mission steps config
        <input type="url" id="missionStepsCfg" placeholder="https://raw.githubusercontent.com/.../xxx.json"
          v-model.trim="injected[index].stepsCfg"
          :aria-invalid="!injected[index].stepsCfg ? undefined : !isStepsCfgURLValid"
          :aria-busy="stepsCfgLoading"
          @change="loadAndValidateCfg"
          required />
      </label>
      <code class="overflow-scroll max-h-28" :aria-busy="stepsCfgLoading">{{ cfgPreview }}</code>
    </div>
    <div v-if="isStepsCfgURLValid && cfgGuideURL">
      <h6 class="mb-1">Mission Guide:</h6>
      <NuxtLink :to="cfgGuideURL" target="_blank">
        {{ cfgGuideURL }}
      </NuxtLink>
    </div>
  </form>
</template>
