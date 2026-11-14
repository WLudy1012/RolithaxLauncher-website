<script setup>
import { assets } from '../links'
import IconMark from './IconMark.vue'

const examples = [
  { name: '生存服务器', source: '远程 Daemon', kind: 'Paper', icon: 'server', state: '运行中', active: true },
  { name: '建筑世界', source: '远程 Daemon', kind: 'Fabric', icon: 'server', state: '已停止', active: false },
  { name: '本机测试服', source: '此 Android 设备', kind: 'Java 17', icon: 'phone', state: '运行中', active: true },
]
</script>

<template>
  <figure class="hero-visual">
    <img class="hero-landscape" :src="assets + 'daemon-night.jpg'" alt="" width="1920" height="1013" fetchpriority="high">
    <figcaption class="visual-label"><span class="signal-dot"></span> 界面示意</figcaption>
    <div class="server-preview">
      <div class="preview-header">
        <div class="preview-brand"><img :src="assets + 'rolithax-logo.png'" width="23" height="23" alt=""> <span>服务器工作台</span></div>
        <span class="preview-label">INSTANCES</span>
      </div>
      <div class="preview-main">
        <div class="preview-title">
          <strong>实例管理</strong>
          <span>本机与远端</span>
        </div>
        <ul>
          <li v-for="item in examples" :key="item.name">
            <span class="preview-icon"><IconMark :name="item.icon" :size="17" /></span>
            <div class="preview-name"><strong>{{ item.name }}</strong><small>{{ item.source }} · {{ item.kind }}</small></div>
            <span class="preview-status" :class="{ 'is-running': item.active }"><i></i>{{ item.state }}</span>
          </li>
        </ul>
      </div>
      <div class="preview-footer"><IconMark name="terminal" :size="16" /><span>控制台</span><span>文件</span><span>实例配置</span></div>
    </div>
  </figure>
</template>
