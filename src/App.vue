<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import HomePage from './pages/HomePage.vue'
import DownloadPage from './pages/DownloadPage.vue'

defineProps({ page: { type: String, default: 'home' } })
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <SiteHeader :page="page" />
  <main id="main-content" tabindex="-1">
    <DownloadPage v-if="page === 'download'" />
    <HomePage v-else />
  </main>
  <SiteFooter />
</template>
