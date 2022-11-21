<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    url: string;
    author?: string;
  }>(),
  {
    author: "developers.flow.com",
  }
);
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="author" :content="author" />
    <Meta name="description" :content="description" />

    <!--  Essential META Tags -->
    <Meta property="og:type" content="article" />
    <Meta property="og:title" :content="title" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:url" :content="url" />

    <!-- Twitter related -->
    <Meta name="twitter:title" :content="title" />
    <Meta name="twitter:description" :content="description" />

    <!-- Other meta -->
    <slot />
  </Head>
</template>
