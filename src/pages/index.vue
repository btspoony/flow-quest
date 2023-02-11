<script setup lang="ts">
const appConfig = useAppConfig();
</script>

<template>
  <FrameMain>
    <div class="hero min-h-[calc(100vh-180px)]">
      <div class="page-container hero-content flex-col lg:flex-row-reverse">
        <img src="~/assets/images/home-flow.png" alt="home flow" class="max-w-xs" />
        <div>
          <h3 class="text-5xl font-bold">
            Learn and earn rewards by completing Quests <strong class="text-primary">#onFlow</strong>
          </h3>
          <p class="py-6">
            Plan to start the web3 journey? The {{ appConfig.title }} will be your guide.<br />
            Ready to begin?
          </p>
          <div class="flex-center lg:flex-between">
            <BtnGoPage next="/active" class="max-w-xs">Start the Tour</BtnGoPage>
          </div>
        </div>
      </div>
    </div>
  </FrameMain>
</template>
