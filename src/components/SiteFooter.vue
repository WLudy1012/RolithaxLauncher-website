<script setup>
import { assets, mirror, repository } from '../links'
import IconMark from './IconMark.vue'
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <a class="brand" href="./">
          <img :src="assets + 'rolithax-logo.png'" width="36" height="36" alt="">
          <span>Rolithax<small>Launcher</small></span>
        </a>
        <p>独立的 MSLX Daemon 客户端，与 MSLTeam 无隶属关系。</p>
      </div>
      <nav class="footer-links" aria-label="项目链接">
        <a :href="repository" target="_blank" rel="noopener noreferrer">源码 <IconMark name="external" :size="13" /></a>
        <a :href="mirror" target="_blank" rel="noopener noreferrer">CNB 发布</a>
        <a :href="repository + '/issues'" target="_blank" rel="noopener noreferrer">问题反馈</a>
        <a :href="repository + '/blob/main/LICENSE'" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>
        <a :href="repository + '/blob/main/DISCLAIMER.txt'" target="_blank" rel="noopener noreferrer">免责声明</a>
      </nav>
    </div>
  </footer>
</template>
