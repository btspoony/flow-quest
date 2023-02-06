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
    <!-- Primary Meta Tags -->
    <Meta name="title" :content="title" />
    <Meta name="author" :content="author" />
    <Meta name="description" :content="description" />

    <!-- Open Graph / Facebook -->
    <Meta property="og:type" content="website" />
    <Meta property="og:url" :content="url" />
    <Meta property="og:title" :content="title" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:image" content="https://flowquest.xyz/social.png" />

    <!-- Twitter -->
    <Meta name="twitter:card" property="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" property="twitter:title" :content="title" />
    <Meta name="twitter:description" property="twitter:description" :content="description" />
    <Meta name="twitter:url" property="twitter:url" :content="url" />
    <Meta name="twitter:image" property="twitter:image" content="https://flowquest.xyz/social.png" />

    <!-- Other meta -->
    <slot />
  </Head>
</template>
