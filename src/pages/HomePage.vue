<script setup>
import { ref } from 'vue'
import { assets, repository, plugin } from '../links'
import IconMark from '../components/IconMark.vue'
import ServerPreview from '../components/ServerPreview.vue'

const platforms = [
  {
    name: 'Android',
    icon: 'phone',
    note: '口袋里的服务器工作台',
    detail: 'Android 7.0+ · 本机开服与远端管理',
    href: '/download#android',
    action: '下载 APK',
  },
  {
    name: 'Windows',
    icon: 'server',
    note: '为桌面而生',
    detail: 'x64 · WinUI 3 远端管理客户端',
    href: '/download#windows',
    action: '下载 Windows 版',
  },
  {
    name: 'Linux',
    icon: 'terminal',
    note: '熟悉的系统，同样好用',
    detail: 'x64 · 内含运行时的远端客户端',
    href: '/download#linux',
    action: '下载 Linux 版',
  },
]
const features = [
  {
    icon: 'network',
    title: '多个节点，清楚分开',
    body: '在同一处查看本机与远端实例，按 Daemon 筛选。进入哪个实例，就管理哪个实例。',
  },
  {
    icon: 'terminal',
    title: '问题现场，随时打开',
    body: '查看实时控制台、发送命令、启停服务端。在手机上，也能处理日常维护。',
  },
  {
    icon: 'folders',
    title: '文件配置，触手可及',
    body: '浏览实例目录、调整服务器配置、维护世界文件，少一些来回切换。',
  },
]
const faqs = [
  [
    '这是 Minecraft 游戏启动器吗？',
    'Rolithax 面向服务器管理。在 Android 上，你可以运行 Minecraft Java 服务端；也可以连接已有的 MSLX Daemon，管理远端实例。它不用于启动 Minecraft 游戏客户端。',
  ],
  [
    '手机开服需要什么？',
    '需要 Android 7.0 或更新版本，以及匹配服务端要求的 Java 运行时。应用会按需下载运行时。实际可承载人数取决于设备性能、服务端配置和网络；外网访问还需要可用的网络连接方案。',
  ],
  [
    '怎样连接已有的服务器？',
    '在 MSLX Daemon 安装 Rolithax 插件后，可以使用插件提供的配对二维码；也可以在客户端输入 Daemon 地址与 API Key。请确保手机能访问该地址。',
  ],
  [
    'Windows、Linux 和鸿蒙也能本机开服吗？',
    '这些客户端面向远端管理，本机开服由 Android 提供。Windows 和 Linux 已有公开安装包；HarmonyOS NEXT 仍处于适配与验证阶段，以仓库构建说明为准。',
  ],
  [
    '软件是否开源？',
    '是。Rolithax Launcher 按 AGPL-3.0 开源，源码与公开版本都可以在 GitHub 查看。你也可以通过 Issues 提交问题或参与开发。',
  ],
]
const selected = ref('instances')
</script>

<template>
  <section id="top" class="hero" aria-labelledby="home-title">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="container hero-copy">
      <a
        class="hero-badge"
        :href="repository"
        target="_blank"
        rel="noopener noreferrer"
        ><span class="signal-dot"></span> 开源的 Minecraft 服务器管理工具
        <IconMark name="arrow" :size="14"
      /></a>
      <h1 id="home-title">你的世界，<br /><em>随时在手。</em></h1>
      <p class="hero-description">
        在手机上开服，在任何地方管服。<br
          class="desktop-break"
        />把实例、日志和文件收进一个工作台，专心照顾你的 Minecraft 世界。
      </p>
      <div class="hero-actions">
        <a class="button button--primary" href="/download"
          ><IconMark name="download" /> 下载 Rolithax</a
        >
        <a
          class="button button--quiet"
          :href="repository + '#快速开始'"
          target="_blank"
          rel="noopener noreferrer"
          >阅读文档 <IconMark name="external" :size="17"
        /></a>
      </div>
      <p class="hero-meta">
        Android · Windows · Linux <span> / </span> AGPL-3.0 开源
      </p>
    </div>
    <div class="container showcase"><ServerPreview /></div>
  </section>

  <section
    id="world"
    class="container section"
    aria-labelledby="features-title"
  >
    <div class="section-heading centered">
      <p class="eyebrow">少一点折腾，多一点创造</p>
      <h2 id="features-title">开服之后的事，<br />也照顾周全。</h2>
      <p>从日常启停到现场排查，把常用操作放到你找得到的地方。</p>
    </div>
    <div class="feature-grid">
      <article v-for="item in features" :key="item.title" class="feature-item">
        <span class="feature-icon"
          ><IconMark :name="item.icon" :size="25"
        /></span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.body }}</p>
      </article>
    </div>
  </section>

  <section id="local" class="mobile-section">
    <div class="container section split-section">
      <div class="feature-copy">
        <p class="eyebrow">ANDROID / 本机与远端</p>
        <h2>口袋不大。<br />装得下一个世界。</h2>
        <p>
          用 Android 创建 Java 服务端，或接入远端
          Daemon。每个实例都有自己的配置、文件和控制台。
        </p>
        <div class="view-switch" role="group" aria-label="查看应用界面">
          <button
            :aria-pressed="selected === 'instances'"
            @click="selected = 'instances'"
          >
            多实例管理</button
          ><button
            :aria-pressed="selected === 'create'"
            @click="selected = 'create'"
          >
            手机本机开服
          </button>
        </div>
        <div class="feature-detail">
          <Transition name="copy-swap" mode="out-in">
            <div :key="selected">
              <h3>
                {{
                  selected === 'instances'
                    ? '每个服务器，都有自己的位置。'
                    : '选好核心，让世界开始运行。'
                }}
              </h3>
              <p>
                {{
                  selected === 'instances'
                    ? '本机与不同 Daemon 的实例集中展示，按来源筛选后再操作，不用反复记地址。'
                    : '按游戏版本与服务器核心选择 Java 运行时。安装包不捆绑 JRE，需要开服时再下载。'
                }}
              </p>
            </div>
          </Transition>
        </div>
        <a class="text-link" href="/download#android"
          >获取 Android 版 <IconMark name="arrow" :size="17"
        /></a>
      </div>
      <figure class="phone-stage">
        <div class="phone-orbit" aria-hidden="true"></div>
        <div class="phone-frame">
          <Transition name="phone-swap">
            <img
              :key="selected"
              class="phone-shot"
              :src="
                assets +
                (selected === 'instances'
                  ? 'android-instances.png'
                  : 'android-create.png')
              "
              :alt="
                selected === 'instances'
                  ? 'Rolithax Android 开发版的多实例管理页面'
                  : 'Rolithax Android 开发版的新建服务器页面'
              "
              width="1080"
              height="2400"
              loading="lazy"
            />
          </Transition>
        </div>
        <figcaption>Android 开发版实机界面</figcaption>
      </figure>
    </div>
  </section>

  <section id="console" class="container section connection-section">
    <div class="section-heading">
      <p class="eyebrow">连接已有的 MSLX DAEMON</p>
      <h2>距离远一点。<br />管理近一点。</h2>
      <p>
        通过配对二维码或 API Key
        连接。远端服务器继续运行，你用熟悉的界面接手日常操作。
      </p>
      <a
        class="text-link"
        :href="plugin"
        target="_blank"
        rel="noopener noreferrer"
        >获取 Rolithax 配对插件 <IconMark name="external" :size="17"
      /></a>
    </div>
    <div class="connection-flow">
      <div>
        <span class="step">01</span><IconMark name="server" :size="28" />
        <h3>准备 Daemon</h3>
        <p>确认服务地址可访问，准备 API Key 或安装配对插件。</p>
      </div>
      <div>
        <span class="step">02</span><IconMark name="link" :size="28" />
        <h3>建立连接</h3>
        <p>扫描插件二维码，或者填写地址和密钥。</p>
      </div>
      <div>
        <span class="step">03</span><IconMark name="terminal" :size="28" />
        <h3>进入实例</h3>
        <p>查看运行状态，打开控制台，开始管理。</p>
      </div>
    </div>
  </section>

  <section id="platforms" class="platform-section">
    <div class="container section">
      <div class="section-heading centered">
        <p class="eyebrow">在你的设备上见</p>
        <h2>选一个顺手的屏幕。</h2>
        <p>Android 支持本机开服与远端管理，桌面端专注远端工作。</p>
      </div>
      <div class="platform-grid">
        <article
          v-for="platform in platforms"
          :key="platform.name"
          class="platform-card"
        >
          <IconMark :name="platform.icon" :size="32" />
          <h3>{{ platform.name }}</h3>
          <p>{{ platform.note }}</p>
          <small>{{ platform.detail }}</small
          ><a class="button button--quiet" :href="platform.href"
            >{{ platform.action }} <IconMark name="down" :size="17"
          /></a>
        </article>
      </div>
      <p class="harmony-note">
        HarmonyOS NEXT 正在适配。<a
          :href="repository + '/blob/main/harmony/README.md'"
          target="_blank"
          rel="noopener noreferrer"
          >查看构建进度 ↗</a
        >
      </p>
    </div>
  </section>

  <section id="faq" class="container section faq-section">
    <div class="section-heading">
      <p class="eyebrow">开始之前</p>
      <h2>你可能想问。</h2>
      <p>
        还有疑问？<a
          class="text-link"
          :href="repository + '/issues'"
          target="_blank"
          rel="noopener noreferrer"
          >去 GitHub 聊聊 ↗</a
        >
      </p>
    </div>
    <div class="faq-list">
      <details v-for="[question, answer] in faqs" :key="question">
        <summary>{{ question }}<span aria-hidden="true">+</span></summary>
        <p>{{ answer }}</p>
      </details>
    </div>
  </section>

  <section class="container final-cta">
    <div>
      <p class="eyebrow">ROLITHAX LAUNCHER</p>
      <h2>下一个世界，<br />由你来照顾。</h2>
    </div>
    <a class="button button--primary" href="/download"
      >免费下载 <IconMark name="download"
    /></a>
  </section>
</template>
