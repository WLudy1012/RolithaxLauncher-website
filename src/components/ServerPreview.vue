<script setup>
import { assets } from '../links'
import IconMark from './IconMark.vue'
const servers = [
  {
    name: '与朋友的生存世界',
    type: 'Paper · 1.21',
    source: '远端 Daemon',
    state: '运行中',
    active: true,
  },
  {
    name: '建筑与红石',
    type: 'Fabric · 1.21',
    source: '远端 Daemon',
    state: '已停止',
    active: false,
  },
  {
    name: '口袋里的测试服',
    type: 'Java 21',
    source: 'Android 本机',
    state: '运行中',
    active: true,
  },
]
</script>
<template>
  <figure class="product-window">
    <div class="window-bar">
      <div class="window-brand">
        <img
          :src="assets + 'rolithax-logo.png'"
          width="22"
          height="22"
          alt=""
        />Rolithax Launcher
      </div>
      <span class="window-caption">产品功能示意</span
      ><span class="window-controls" aria-hidden="true">─　□　×</span>
    </div>
    <div class="window-body">
      <aside class="mock-sidebar" aria-hidden="true">
        <div class="mock-nav active"><IconMark name="server" />实例管理</div>
        <div class="mock-nav"><IconMark name="network" />连接</div>
        <div class="mock-nav"><IconMark name="layers" />资源中心</div>
        <div class="mock-sidebar-bottom">让每个世界有条不紊。</div>
      </aside>
      <div class="mock-workspace">
        <div class="mock-heading">
          <div>
            <span>工作台 / 实例</span>
            <h2>你的服务器</h2>
          </div>
          <span class="mock-add"
            ><IconMark name="check" :size="14" /> 连接就绪</span
          >
        </div>
        <div
          class="mock-banner"
          :style="{
            backgroundImage:
              'linear-gradient(90deg, #142f28ee, #142f2822), url(' +
              assets +
              'daemon-night.jpg)',
          }"
        >
          <div>
            <small>MINECRAFT JAVA EDITION</small>
            <h3>世界在运行，<br />一切在掌握。</h3>
          </div>
          <span>本机与远端<br /><strong>同一处管理</strong></span>
        </div>
        <div class="mock-list">
          <div class="mock-list-head">
            <strong>全部实例</strong><span>3 个实例</span>
          </div>
          <div v-for="server in servers" :key="server.name" class="mock-server">
            <span class="mock-server-icon"
              ><IconMark
                :name="server.source.includes('Android') ? 'phone' : 'server'"
                :size="21"
            /></span>
            <div class="mock-server-name">
              <strong>{{ server.name }}</strong
              ><small
                >{{ server.type }} <span>· {{ server.source }}</span></small
              >
            </div>
            <span class="mock-state" :class="{ running: server.active }"
              ><i></i>{{ server.state }}</span
            ><IconMark name="arrow" :size="17" />
          </div>
        </div>
      </div>
    </div>
    <figcaption class="sr-only">
      实例管理功能示意，示例名称与运行状态不代表实际服务器。
    </figcaption>
  </figure>
</template>
