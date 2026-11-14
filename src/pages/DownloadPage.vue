<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { APK, DESKTOP, DESKTOP_BUILDS, PROVIDERS, compareVersions, fetchRelease, formatSize, preferredSource, releaseSnapshots, runtimeVersion } from '../lib/releases.js'

const sources = Object.keys(PROVIDERS)
const releases = reactive(releaseSnapshots())
const statuses = reactive({ cnb: 'loading', github: 'loading' })
const selectedSource = ref(null)
const source = computed(() => selectedSource.value || preferredSource(releases))
const release = computed(() => releases[source.value])
const provider = computed(() => PROVIDERS[source.value])
const updating = computed(() => sources.some((key) => statuses[key] === 'loading'))
const copyFeedback = ref('')
const copiedAsset = ref('')

const packages = computed(() => {
  const current = release.value
  const android = current.assets[APK.current]
    ? [{ id: 'android', name: 'Android', filename: APK.current, description: '适用于 Android 7.0 及以上。手机本机开服时按需下载 Java 运行时。' }]
    : [
      { id: 'android', name: 'Android 完整版', filename: APK.full, description: '此历史版本内置 Java 17 运行时。' },
      { id: 'android-lite', name: 'Android 精简版', filename: APK.lite, description: '此历史版本在手机本机开服时按需下载 Java 运行时。' },
    ].filter((item) => current.assets[item.filename])
  if (android[0]) android[0].id = 'android'
  const desktop = [
    { id: 'windows', name: 'Windows', format: 'EXE / x64', filename: DESKTOP.windows, description: '离线安装程序内含应用和运行时，用于远端管理。' },
    { id: 'linux', name: 'Linux', format: 'TAR.GZ / x64', filename: DESKTOP.linux, description: '归档内含 Java 运行时。解压后运行 RolithaxLauncher/bin/RolithaxLauncher。' },
  ]
  return [...android, ...desktop].map((item) => {
    const assetSource = current.assets[item.filename] ? source.value : 'github'
    const assetRelease = releases[assetSource]
    return { ...item, asset: assetRelease.assets[item.filename], tag: assetRelease.tag, source: assetSource }
  })
})

const runtimeAssets = computed(() => Object.values(release.value.assets)
  .filter((asset) => runtimeVersion(asset.name))
  .sort((first, second) => runtimeVersion(first.name) - runtimeVersion(second.name)))
const checksumAsset = computed(() => release.value.assets['SHA256SUMS.txt'])
const dateLabel = computed(() => {
  const value = Date.parse(release.value.publishedAt)
  return Number.isFinite(value)
    ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'Asia/Shanghai' }).format(value)
    : '时间待发布'
})

const statusLabels = {
  loading: '同步中',
  live: '实时数据',
  snapshot: '发布快照',
}

let activeRequest
async function refreshReleases() {
  activeRequest?.abort()
  const request = new AbortController()
  activeRequest = request
  await Promise.all(sources.map(async (key) => {
    statuses[key] = 'loading'
    try {
      const data = await fetchRelease(key, request.signal)
      if (!request.signal.aborted) {
        if (compareVersions(data.tag, releases[key].tag) >= 0) {
          releases[key] = data
          statuses[key] = 'live'
        } else {
          statuses[key] = 'snapshot'
        }
      }
    } catch {
      if (!request.signal.aborted) statuses[key] = 'snapshot'
    }
  }))
}

function selectSource(value) {
  selectedSource.value = value
  copyFeedback.value = ''
  copiedAsset.value = ''
}

async function copyHash(hash, name) {
  try {
    await navigator.clipboard.writeText(hash)
    copiedAsset.value = name
    copyFeedback.value = '已复制 ' + name + ' 的 SHA-256'
  } catch {
    copyFeedback.value = '无法访问剪贴板，可以选中摘要后手动复制。'
  }
}

onMounted(refreshReleases)
onBeforeUnmount(() => activeRequest?.abort())
</script>

<template>
  <div class="download-page">
    <section class="download-hero container" aria-labelledby="download-heading">
      <div class="hero-copy">
        <p class="eyebrow">Rolithax Launcher / 下载</p>
        <h1 id="download-heading">下载客户端</h1>
        <p class="hero-intro">
          使用 Android、Windows 或 Linux 管理远端 MSLX Daemon。Android 也可以在手机上运行 Minecraft Java 服务器。
        </p>
        <a class="button button--primary" href="#packages">选择安装包 <span aria-hidden="true">↓</span></a>
      </div>

      <aside class="release-overview" aria-label="当前下载版本">
        <div class="release-overview-head">
          <span class="release-caption">{{ provider.name }} RELEASE</span>
          <span class="source-status" :data-status="statuses[source]" aria-live="polite">
            {{ statusLabels[statuses[source]] }}
          </span>
        </div>
        <p class="release-tag">{{ release.tag }}</p>
        <div class="release-overview-foot">
          <time v-if="release.publishedAt" :datetime="release.publishedAt">{{ dateLabel }}</time>
          <span v-else>{{ dateLabel }}</span>
          <a :href="release.releaseUrl">发布说明 <span aria-hidden="true">↗</span></a>
        </div>
      </aside>
    </section>

    <section id="packages" class="package-section container" aria-labelledby="packages-heading">
      <div class="package-section-head">
        <div>
          <h2 id="packages-heading">选择安装包</h2>
          <p class="section-intro">Windows 和 Linux 提供 x64 版本。</p>
        </div>

        <fieldset class="source-picker">
          <legend>下载来源</legend>
          <label v-for="key in sources" :key="key" class="source-option">
            <input
              type="radio"
              name="release-source"
              :value="key"
              :checked="source === key"
              @change="selectSource(key)"
            >
            <span>{{ PROVIDERS[key].name }} <small>{{ releases[key].tag }}</small></span>
          </label>
        </fieldset>
      </div>

      <div class="package-grid">
        <article v-for="item in packages" :id="item.id" :key="item.filename" class="package-card">
          <div class="package-meta">
            <span>{{ item.format || 'APK' }}</span>
            <span v-if="item.asset">{{ formatSize(item.asset.size) }}</span>
          </div>
          <h3>{{ item.name }}</h3>
          <p class="package-description">{{ item.description }}</p>
          <p class="package-filename">
            {{ item.filename }}
            <span v-if="item.source !== source"> · GitHub {{ item.tag }}</span>
          </p>
          <a
            v-if="item.asset"
            class="button button--primary package-link"
            :href="item.asset.url"
          >下载 {{ item.name }} <span aria-hidden="true">↓</span></a>
          <a v-else class="button button--quiet package-link" :href="releases[item.source].releaseUrl">
            查看 {{ item.name }} 发布附件 <span aria-hidden="true">↗</span>
          </a>
          <details v-if="item.asset?.hash" class="hash-details">
            <summary>查看 SHA-256</summary>
            <div class="hash-body">
              <code>{{ item.asset.hash }}</code>
              <button type="button" @click="copyHash(item.asset.hash, item.filename)">{{ copiedAsset === item.filename ? '已复制' : '复制' }}</button>
            </div>
          </details>
          <p v-else-if="item.asset" class="hash-unavailable">此附件未公布 SHA-256</p>
        </article>
      </div>

      <div class="source-note">
        <div>
          <p v-if="statuses[source] === 'loading'">正在同步 {{ provider.name }}。当前显示已核对的公开发布记录。</p>
          <p v-else-if="statuses[source] === 'snapshot'">暂时无法同步 {{ provider.name }}。当前显示 {{ release.tag }} 的发布快照。</p>
          <p v-else>附件与 SHA-256 来自 {{ provider.name }} 的公开发布记录。</p>
          <p v-if="releases.cnb.tag !== releases.github.tag">两个来源的版本不同，请以当前选择显示的版本号为准。</p>
        </div>
        <button type="button" class="refresh-button" :disabled="updating" @click="refreshReleases">
          {{ updating ? '同步中…' : '重新同步' }}
        </button>
      </div>
      <p class="download-feedback" role="status">{{ copyFeedback }}</p>
    </section>

    <section v-if="runtimeAssets.length || checksumAsset" class="runtime-section container" aria-labelledby="runtime-heading">
      <div class="runtime-head">
        <p class="eyebrow">Java / Runtime</p>
        <h2 id="runtime-heading">运行时与校验</h2>
        <p class="section-intro">按服务端所需的 Java 版本下载。应用也支持按需获取运行时。</p>
      </div>
      <ul class="runtime-list">
        <li v-for="asset in runtimeAssets" :key="asset.name" class="runtime-row">
          <div>
            <strong>Java {{ runtimeVersion(asset.name) }}</strong>
            <span class="runtime-filename">{{ asset.name }}</span>
            <details v-if="asset.hash" class="hash-details">
              <summary>查看 SHA-256</summary>
              <div class="hash-body">
                <code>{{ asset.hash }}</code>
                <button type="button" @click="copyHash(asset.hash, asset.name)">{{ copiedAsset === asset.name ? '已复制' : '复制' }}</button>
              </div>
            </details>
          </div>
          <span class="runtime-size">{{ formatSize(asset.size) }}</span>
          <a :href="asset.url" :aria-label="'下载 Java ' + runtimeVersion(asset.name) + ' 归档'">下载 <span aria-hidden="true">↓</span></a>
        </li>
        <li v-if="checksumAsset" class="runtime-row">
          <div>
            <strong>附件校验清单</strong>
            <span class="runtime-filename">{{ checksumAsset.name }}</span>
          </div>
          <span class="runtime-size"></span>
          <a :href="checksumAsset.url">下载 <span aria-hidden="true">↓</span></a>
        </li>
      </ul>
    </section>

    <section class="download-notes container" aria-labelledby="install-heading">
      <div class="notes-heading">
        <p class="eyebrow">安装 / INSTALL</p>
        <h2 id="install-heading">安装前确认</h2>
      </div>
      <div class="notes-content">
        <p>核对文件时，请使用下载按钮所在卡片提供的 SHA-256。</p>
        <p>从早期 MSLX Android 迁移时，先在旧应用导出备份，再到 Rolithax Launcher 中导入。系统会把两者识别为独立应用。</p>
        <div class="release-links">
          <a :href="PROVIDERS.cnb.releases">CNB 发布列表 <span aria-hidden="true">↗</span></a>
          <a :href="PROVIDERS.github.releases">GitHub 发布列表 <span aria-hidden="true">↗</span></a>
          <a :href="DESKTOP_BUILDS">Windows / Linux 开发构建 <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.download-page {
  --download-gutter: clamp(20px, 5vw, 72px);
}

.download-page h1,
.download-page h2,
.download-page h3,
.download-page p {
  margin: 0;
}

.download-page .eyebrow {
  margin-bottom: 16px;
}

.download-page a:focus-visible,
.download-page button:focus-visible,
.download-page summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.download-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(270px, 0.57fr);
  align-items: end;
  gap: var(--download-gutter);
  padding-block: clamp(54px, 9vw, 128px) clamp(56px, 8vw, 104px);
}

.download-page h1 {
  color: var(--text);
  font-size: clamp(3rem, 7.8vw, 6.7rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.download-page .hero-intro {
  max-width: 34rem;
  margin-block: 25px 30px;
  color: var(--muted);
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  line-height: 1.8;
}

.hero-copy .button {
  gap: 1rem;
}

.release-overview {
  min-width: 0;
  padding: clamp(20px, 4vw, 40px);
  border: 1px solid var(--line);
  border-top-color: var(--accent);
  background: var(--surface);
}

.release-overview-head,
.release-overview-foot,
.package-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.release-caption,
.package-meta {
  color: var(--muted);
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.source-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 0.75rem;
  white-space: nowrap;
}

.source-status[data-status="live"]::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  content: '';
}

.download-page .release-tag {
  margin-block: clamp(20px, 3vw, 34px);
  color: var(--text);
  font-family: var(--mono, ui-monospace, monospace);
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.08em;
  overflow-wrap: anywhere;
}

.release-overview-foot {
  flex-wrap: wrap;
  padding-top: 15px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.85rem;
}

.release-overview-foot a,
.release-links a,
.runtime-row > a {
  color: var(--text);
  text-underline-offset: 0.24em;
}

.release-overview-foot a:hover,
.release-links a:hover,
.runtime-row > a:hover {
  color: var(--accent);
}

.package-section,
.runtime-section,
.download-notes {
  padding-block: clamp(40px, 6vw, 76px);
  border-top: 1px solid var(--line);
}

.package-section {
  scroll-margin-top: 86px;
}

.package-section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.download-page h2 {
  color: var(--text);
  font-size: clamp(2rem, 4.5vw, 3.7rem);
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.download-page .section-intro {
  margin-top: 12px;
  color: var(--muted);
  line-height: 1.7;
}

.source-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.source-picker legend {
  margin-bottom: 7px;
  padding: 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.source-option {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.source-option input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.source-option > span {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.88rem;
}

.source-option small {
  color: inherit;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 0.72rem;
}

.source-option input:checked + span {
  border-color: var(--accent);
  color: var(--text);
}

.source-option input:focus-visible + span {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.source-option:hover > span {
  color: var(--text);
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.package-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: clamp(20px, 4vw, 40px);
  border: 1px solid var(--line);
  background: var(--surface);
  scroll-margin-top: 86px;
}

.package-meta > :first-child {
  color: var(--accent);
}

.download-page .package-card h3 {
  margin-top: 22px;
  color: var(--text);
  font-size: clamp(1.7rem, 3vw, 2.55rem);
  letter-spacing: -0.035em;
}

.download-page .package-description {
  max-width: 31rem;
  margin-block: 13px 26px;
  color: var(--muted);
  line-height: 1.75;
}

.download-page .package-filename {
  margin-top: auto;
  margin-bottom: 10px;
  color: var(--muted);
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.package-link {
  align-self: start;
  justify-content: space-between;
  gap: 12px;
}

.hash-details,
.download-page .hash-unavailable {
  margin-top: 16px;
  color: var(--muted);
  font-size: 0.8rem;
}

.hash-details summary {
  width: fit-content;
  min-height: 28px;
  cursor: pointer;
  line-height: 28px;
}

.hash-body {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-top: 6px;
}

.hash-body code {
  min-width: 0;
  color: var(--text);
  font-family: var(--mono, ui-monospace, monospace);
  overflow-wrap: anywhere;
  user-select: all;
}

.hash-body button,
.refresh-button {
  min-height: 32px;
  padding: 0 8px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.hash-body button:hover,
.refresh-button:hover:not(:disabled) {
  border-color: var(--accent);
}

.refresh-button:disabled {
  color: var(--muted);
  cursor: wait;
}

.source-note {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
  margin-top: 18px;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.6;
}

.download-feedback {
  min-height: 1.45em;
  padding-top: 5px;
  color: var(--accent);
  font-size: 0.82rem;
}

.runtime-section,
.download-notes {
  display: grid;
  grid-template-columns: minmax(0, 0.6fr) minmax(0, 1fr);
  gap: var(--download-gutter);
}

.runtime-list {
  min-width: 0;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
  list-style: none;
}

.runtime-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: start;
  gap: 12px;
  padding-block: 15px;
  border-bottom: 1px solid var(--line);
}

.runtime-row strong {
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
}

.runtime-filename,
.runtime-size {
  color: var(--muted);
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 0.76rem;
  overflow-wrap: anywhere;
}

.runtime-filename {
  display: block;
  margin-top: 5px;
}

.runtime-row .hash-details {
  margin-top: 4px;
}

.runtime-row > a {
  padding-inline: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.notes-content {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  color: var(--muted);
  line-height: 1.8;
}

.release-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  margin-top: 8px;
  font-size: 0.9rem;
}

@media (max-width: 780px) {
  .download-hero,
  .runtime-section,
  .download-notes {
    grid-template-columns: minmax(0, 1fr);
  }

  .release-overview {
    max-width: 480px;
  }

  .release-overview,
  .source-picker {
    width: 100%;
  }

  .package-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .package-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .package-link {
    align-self: stretch;
    width: 100%;
  }

  .runtime-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .runtime-size {
    display: none;
  }
}
</style>
