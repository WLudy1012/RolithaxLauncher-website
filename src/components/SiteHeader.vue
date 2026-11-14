<script setup>
import { assets, repository } from '../links'
import IconMark from './IconMark.vue'

defineProps({ page: { type: String, required: true } })
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="./" aria-label="Rolithax Launcher 首页">
        <img :src="assets + 'rolithax-logo.png'" width="38" height="38" alt="">
        <span>Rolithax<small>Launcher</small></span>
      </a>
      <nav class="site-nav" aria-label="主导航">
        <a :href="page === 'home' ? '#world' : './#world'">功能</a>
        <a :href="page === 'home' ? '#platforms' : './#platforms'">平台</a>
        <a href="./download.html" :aria-current="page === 'download' ? 'page' : undefined">下载</a>
      </nav>
      <div class="header-actions">
        <a class="header-source" :href="repository" target="_blank" rel="noopener noreferrer">
          GitHub <IconMark name="external" :size="14" />
        </a>
        <a class="button button--primary header-download" :href="page === 'download' ? '#packages' : './download.html'">
          <IconMark name="download" :size="17" />
          <span>下载 Android</span>
        </a>
      </div>
    </div>
  </header>
</template>
