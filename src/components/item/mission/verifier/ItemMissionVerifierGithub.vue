<script setup lang="ts">
import { Icon } from '@iconify/vue';

const github = useGithubProfile()
const injected = inject(missionGithubVerifyInjectKey)

defineExpose({
  execute: ref(executeVerification),
})

const reposLoading = reactive<boolean[]>([])
const reposResults = reactive<{ valid: boolean, contributions?: number, repo?: string }[]>([])

async function executeVerification() {
  if (!injected || !github.value.data) return

  reposResults.length = 0
  reposLoading.length = 0

  await Promise.all((injected.repos.value ?? []).map(async (repo, i) => {
    reposLoading[i] = true
    const list = await loadRepoContributors(repo)
    const matched = list.find(one => one.id === github.value.data?.id)
    if (matched) {
      reposResults[i] = { valid: true, contributions: matched.contributions ?? 1, repo }
    } else {
      reposResults[i] = { valid: false }
    }
    reposLoading[i] = false
  }))

  const validatedRepos = reposResults.filter(one => one.valid)
  if (validatedRepos.length > 0) {
    injected.updateValidRepos(validatedRepos.map(one => one.repo!))
  }
}

async function loadRepoContributors(key: string) {
  const { $githubApi } = useNuxtApp()
  const [owner, repo] = key.split('/')
  if (!owner || !repo) return []

  const loadOnePage = async (page: number) => {
    return await $githubApi.listRepoContributors({
      params: { owner, repo },
      query: {
        per_page: 100,
        page: 1 + page
      }
    })
  }

  let all: any[] = []
  let page = 0
  let list: any[]
  do {
    list = await loadOnePage(page)
    all = all.concat(list)
    page++
  } while (list.length > 0)
  return all
}

</script>

<template>
  <div v-if="!!injected" class="w-full my-4">
    <div v-if="github.auth" class="flex flex-col gap-2">
      <h4 class="mb-2 text-center">Verifying contributions on Github</h4>
      <div v-for="repo, i in injected.repos.value" :key="`repo_${repo}`"
        class="card card-border non-interactive px-4 py-2 flex gap-3 items-center justify-between">
        <div v-if="reposLoading[i]" :aria-busy="true"></div>
        <Icon v-else-if="typeof reposResults[i]?.valid === 'boolean'"
          :icon="reposResults[i]?.valid ? 'heroicons:check-circle-solid' : 'heroicons:x-circle-solid'"
          :class="['w-5 h-5', reposResults[i]?.valid ? 'text-success' : 'text-failure']" />
        <span class="flex-auto truncate">{{ repo }}</span>
        <span v-if="reposResults[i]?.valid" class="flex-none tag secondary">{{ reposResults[i]?.contributions }}
          contributions</span>
      </div>
    </div>
    <div v-else>
      Please Login with Github
    </div>
  </div>
</template>
