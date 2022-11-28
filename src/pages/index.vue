<script setup lang="ts">
// TODO
</script>

<template>
  <main>
    <div class="hero min-h-[calc(100vh-100px)]">
      <div class="hero-content narrow flex-col lg:flex-row-reverse">
        <img src="~/assets/images/home-flow.png" alt="home flow" class="max-w-xs" />
        <div>
          <h3 class="text-5xl font-bold">
            Learn and earn rewards by completing Flow Developer Challenges
          </h3>
          <p class="py-6">
            We know crypto can be a confusing place. The Dev Competition will be your guide. <br />
            Ready to begin?
          </p>
          <BtnGoPage next="/seasons" class="max-w-xs">Start the Competition</BtnGoPage>
        </div>
      </div>
    </div>
  </main>
</template>
