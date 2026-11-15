<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import HomePage from './pages/HomePage.vue'
import DownloadPage from './pages/DownloadPage.vue'
import { useSiteMotion } from './lib/motion'

defineProps({ page: { type: String, default: 'home' } })
useSiteMotion()
</script>

<template>
  <div class="reading-progress" aria-hidden="true"></div>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <SiteHeader :page="page" />
  <main id="main-content" tabindex="-1">
    <DownloadPage v-if="page === 'download'" />
    <HomePage v-else />
  </main>
  <SiteFooter />
</template>
