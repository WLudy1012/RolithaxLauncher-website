<script setup>
import { computed, ref } from 'vue'
import { assets, plugin, repository } from '../links'
import IconMark from '../components/IconMark.vue'
import ServerPreview from '../components/ServerPreview.vue'

const modes = {
  remote: {
    label: '远端管理',
    icon: 'server',
    number: '01 / REMOTE',
    title: '多台 Daemon，一个实例列表。',
    description: '在同一处查看本机和各个远端节点的实例。进入指定节点后，启停、命令和文件操作都对应所选实例。',
    screenshot: 'android-instances.png',
    alt: 'Rolithax Android 开发版，按 Daemon 筛选的实例列表',
    items: [
      ['link', '快速连接', '扫描 Rolithax 插件生成的配对码，或输入 Daemon 地址与 API Key。'],
      ['terminal', '现场排查', '查看实时控制台日志，发送命令，维护服务器文件与配置。'],
      ['layers', '安装资源', '从资源中心查找兼容的模组和插件，检查依赖后安装。'],
    ],
  },
  local: {
    label: '手机开服',
    icon: 'phone',
    number: '02 / LOCAL',
    title: '在 Android 上启动 Java 服务端。',
    description: '创建实例时选择本机，按游戏版本和核心挑选 Java 运行时。进度、日志、世界文件都可以在同一个应用里管理。',
    screenshot: 'android-create.png',
    alt: 'Rolithax Android 开发版，新建本机服务器的操作界面',
    items: [
      ['layers', '选择核心与运行时', '按服务器核心的要求选择兼容的 Java 8、17、21 或 25。'],
      ['terminal', '管理运行过程', '从应用内启动服务端，在控制台查看日志或发送 stop 命令。'],
      ['folders', '维护世界文件', '浏览实例目录，调整 server.properties 和服务器资源。'],
    ],
  },
}

const activeMode = ref('remote')
const selected = computed(() => modes[activeMode.value])
const platforms = [
  { name: 'Android', info: '本机开服与远端 Daemon 管理', status: '正式版', link: './download.html#android', action: '下载 APK', icon: 'phone' },
  { name: 'Windows', info: 'WinUI 3 远端管理工作区', status: '正式版', link: './download.html#windows', action: '下载 x64 安装包', icon: 'server' },
  { name: 'Linux', info: 'Compose Desktop 远端客户端', status: '正式版', link: './download.html#linux', action: '下载 x64 归档', icon: 'terminal' },
  { name: 'HarmonyOS NEXT', info: 'ArkTS 原生适配，HAP 待验证', status: '适配中', link: repository + '/blob/main/harmony/README.md', action: '构建说明', icon: 'network', external: true },
]
</script>

<template>
  <section id="top" class="hero container" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="eyebrow"><span class="signal-dot"></span> MINECRAFT JAVA · 服务器管理</p>
      <h1 id="home-title">手机开服，<br><em>随身管服。</em></h1>
      <p class="hero-description">用 Android 运行 Minecraft Java 服务端，或连接已有的 MSLX Daemon。实例启停、实时日志、服务器文件，都能在 Rolithax 里处理。</p>
      <div class="hero-actions">
        <a class="button button--primary" href="./download.html"><IconMark name="download" /> 下载 Rolithax</a>
        <a class="button button--quiet" href="#world">了解功能 <IconMark name="down" :size="17" /></a>
      </div>
      <div class="hero-meta"><span>AGPL-3.0 开源</span><span>支持多个 Daemon</span></div>
    </div>
    <ServerPreview />
  </section>

  <div class="quick-strip container">
    <span class="quick-strip-label">两种使用方式</span>
    <a href="#world" @click="activeMode = 'remote'"><IconMark name="server" />远端 Daemon<IconMark name="external" :size="15" /></a>
    <a href="#world" @click="activeMode = 'local'"><IconMark name="phone" />Android 本机开服<IconMark name="external" :size="15" /></a>
    <a href="#platforms"><IconMark name="layers" />查看各平台状态<IconMark name="external" :size="15" /></a>
  </div>

  <section id="world" class="container section workflow-section" aria-labelledby="workflow-title">
    <div id="modes" class="section-heading">
      <p class="eyebrow">01 / 功能</p>
      <h2 id="workflow-title">从开服到日常管理</h2>
      <p>连接已有的主机，或者在 Android 上新建一个本机实例。</p>
    </div>
    <div id="workflow" class="mode-selector" role="group" aria-label="选择服务器管理方式">
      <button v-for="(mode, key) in modes" :key="key" type="button" :aria-pressed="key === activeMode"
        @click="activeMode = key"><IconMark :name="mode.icon" />{{ mode.label }}</button>
    </div>
    <div class="mode-content">
      <figure class="mode-image">
        <div class="mode-image-grid"></div>
        <img :src="assets + selected.screenshot" :alt="selected.alt" width="1080" height="2400" loading="lazy" decoding="async">
        <figcaption>Android 开发版界面</figcaption>
      </figure>
      <div class="mode-copy" id="local">
        <p class="eyebrow">{{ selected.number }}</p>
        <h3>{{ selected.title }}</h3>
        <p class="mode-description">{{ selected.description }}</p>
        <ul id="console" class="capability-list">
          <li v-for="([icon, title, description]) in selected.items" :key="title">
            <span class="capability-icon"><IconMark :name="icon" /></span>
            <div><strong>{{ title }}</strong><p>{{ description }}</p></div>
          </li>
        </ul>
        <a v-if="activeMode === 'remote'" class="text-link" :href="plugin" target="_blank" rel="noopener noreferrer">
          查看 Rolithax Daemon 插件 <IconMark name="external" :size="16" />
        </a>
        <a v-else class="text-link" :href="repository + '#快速开始'" target="_blank" rel="noopener noreferrer">
          阅读开服说明 <IconMark name="external" :size="16" />
        </a>
      </div>
    </div>
    <span id="path" class="anchor-marker"></span>
  </section>

  <section id="platforms" class="platform-section" aria-labelledby="platform-title">
    <div class="container section">
      <div class="section-heading">
        <p class="eyebrow">02 / 平台</p>
        <h2 id="platform-title">在你的设备上使用</h2>
        <p>Android 支持本机开服。桌面和鸿蒙客户端面向远端 Daemon。</p>
      </div>
      <ul class="platform-list">
        <li v-for="platform in platforms" :key="platform.name">
          <span class="platform-icon"><IconMark :name="platform.icon" :size="21" /></span>
          <div class="platform-name"><strong>{{ platform.name }}</strong><span>{{ platform.info }}</span></div>
          <span class="platform-status" :class="{ 'is-stable': platform.status === '正式版' }">{{ platform.status }}</span>
          <a class="text-link" :href="platform.link" :target="platform.external ? '_blank' : undefined"
            :rel="platform.external ? 'noopener noreferrer' : undefined">
            {{ platform.action }} <IconMark :name="platform.external ? 'external' : 'arrow'" :size="16" />
          </a>
        </li>
      </ul>
    </div>
  </section>

  <section class="container section final-cta" aria-labelledby="cta-title">
    <div>
      <h2 id="cta-title">选择你的安装包</h2>
      <p>Android 本机开服时按需下载 Java。Windows 和 Linux 的安装包已包含各自的运行时。</p>
    </div>
    <a class="button button--primary" href="./download.html">查看公开版本 <IconMark name="arrow" /></a>
  </section>
</template>
