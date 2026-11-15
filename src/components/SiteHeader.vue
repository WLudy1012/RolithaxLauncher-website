<script setup>
import { onMounted, ref } from 'vue'
import { assets, repository } from '../links'
import IconMark from './IconMark.vue'
defineProps({ page: { type: String, required: true } })
const open = ref(false)
const dark = ref(false)
onMounted(() => {
  dark.value = document.documentElement.dataset.theme === 'dark'
})
function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.dataset.theme = dark.value ? 'dark' : 'light'
  try {
    localStorage.setItem('rolithax-theme', dark.value ? 'dark' : 'light')
  } catch {}
}
</script>
<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="Rolithax Launcher 首页"
        ><img
          :src="assets + 'rolithax-logo.png'"
          width="34"
          height="34"
          alt=""
        /><span>Rolithax<span class="brand-suffix"> Launcher</span></span></a
      >
      <nav
        class="site-nav"
        :class="{ 'is-open': open }"
        aria-label="主导航"
        id="site-navigation"
        @click="open = false"
      >
        <a href="/#world">功能</a><a href="/#platforms">平台</a
        ><a href="/#faq">常见问题</a
        ><a :href="repository" target="_blank" rel="noopener noreferrer"
          >GitHub <IconMark name="external" :size="13"
        /></a>
      </nav>
      <div class="header-actions">
        <button
          class="theme-toggle"
          type="button"
          @click="toggleTheme"
          aria-label="切换明暗主题"
          :aria-pressed="dark"
        >
          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
            />
          </svg></button
        ><a
          class="button button--primary header-download"
          :href="page === 'download' ? '#packages' : '/download'"
          ><IconMark name="download" :size="16" /><span>下载</span></a
        ><button
          class="menu-toggle"
          :aria-expanded="open"
          aria-controls="site-navigation"
          aria-label="展开或收起导航"
          @click="open = !open"
        >
          <span></span><span></span>
        </button>
      </div>
    </div>
  </header>
</template>
