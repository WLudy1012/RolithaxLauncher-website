const TAG = /^v\d+(?:\.\d+){1,3}(?:-(?:Beta|Force))?$/
const RUNTIME = /^jre(\d+)-[\w.-]+\.tar\.(?:xz|gz)$/i
const SHA256 = /^[a-f0-9]{64}$/i

export const APK = {
  current: 'RolithaxLauncher.apk',
  full: 'app-release.apk',
  lite: 'app-release-lite.apk',
}

export const DESKTOP = {
  windows: 'RolithaxLauncher-Windows-x64-Setup.exe',
  linux: 'RolithaxLauncher-Linux.tar.gz',
}

export const PROVIDERS = {
  cnb: {
    name: 'CNB',
    releases: 'https://cnb.cool/WLudy/RolithaxLauncher/-/releases',
    latest: 'https://cnb.cool/WLudy/RolithaxLauncher/-/releases/latest',
  },
  github: {
    name: 'GitHub',
    releases: 'https://github.com/WLudy1012/RolithaxLauncher/releases',
    latest: 'https://api.github.com/repos/WLudy1012/RolithaxLauncher/releases/latest',
  },
}

export const DESKTOP_BUILDS = 'https://github.com/WLudy1012/RolithaxLauncher/actions/workflows/desktop.yml'

const jre17 = ['jre17-arm64-20210825-release.tar.xz', 38065004, 'c64583ac2e0ec8857e43456fa9adcf482c6a8e454a7133173bf15692d2478b8d']

const publishedSnapshots = {
  cnb: {
    tag: 'v1.8.2',
    publishedAt: '2026-11-08T07:22:02Z',
    assets: [
      [APK.full, 51043473, '36e604889bf75810f01d856cf438a08bf00d6fbf06d47b4be9b5275ad5e61f2b'],
      [APK.lite, 12976980, '735b051bb225e3284568a14c08e236e5066409e9ab51e466bec55c5c06787a96'],
      jre17,
    ],
  },
  github: {
    tag: 'v1.8.3',
    publishedAt: '2026-11-14T14:51:39Z',
    assets: [
      [APK.current, 12984692, 'da4ef5d6015639201e5637d4f9b0943214d00db3bd582f68910c7e3e6bb9f421'],
      [DESKTOP.windows, 67956230, '6589b408f605485a8cf755567791689bc10a9d1784031ec3bff8faf55e265956'],
      [DESKTOP.linux, 80817358, 'a2d47158bf9b955db6f45e07a15a0c521b03492b0a184200877e2470c21a5587'],
      ['jre8-universal.tar.xz', 9540292, '150072cfa1d9e037c31e4bf9770aa5470ae46d0bfefd366b7ce5b2f940ede3f3'],
      ['jre8-arm64-bin.tar.xz', 4347796, 'deed9083a1047af1afaf2d7f1a2de4ae39fadf62c52881f075793e80274956cf'],
      ['jre8-x86_64-bin.tar.xz', 6182832, '37c3f7214ce3086575d7210baa25aee130d8db28c57739f598d24dfbfff32612'],
      jre17,
      ['jre17-x86_64-20210825-release.tar.xz', 39230848, 'ebbdf75ab864a83671a108032c30e67174f79cc19596cfc1d7bfb71be26b6e71'],
      ['jre21-arm64-20260223-release.tar.xz', 29922352, 'd055fc953771e6cfd2206ef770ca675d69b5e4cfd9f3f1e6820ba5820c3cc1dc'],
      ['jre25-arm64-20260223-release.tar.xz', 39109820, '0fdf6d19fe66ea61c12caa24bd655227ddb0d7d9c16c0f13281a7c2878635286'],
      ['SHA256SUMS.txt', 962, '93d7c6d845879fffb252b8c8e796a8bfbfe31d50d744a1db5db9f7a0d59c30cb'],
    ],
  },
}

export function runtimeVersion(assetName) {
  return Number(RUNTIME.exec(assetName)?.[1]) || null
}

const knownPackages = new Set([...Object.values(APK), ...Object.values(DESKTOP), 'SHA256SUMS.txt'])

function isKnownAsset(name) {
  return knownPackages.has(name) || RUNTIME.test(name)
}

function normalizeHash(value) {
  const hash = typeof value === 'string' ? value.trim().replace(/^sha256:/i, '') : ''
  return SHA256.test(hash) ? hash.toLowerCase() : null
}

function readReleaseNotesHashes(notes) {
  const hashes = new Map()
  if (typeof notes !== 'string') return hashes
  for (const line of notes.split(/\r?\n/)) {
    if (!line.trimStart().startsWith('|')) continue
    const [name, ...columns] = line.split('|').slice(1).map((value) => value.trim().replace(/^`|`$/g, ''))
    if (!isKnownAsset(name)) continue
    const hash = columns.map(normalizeHash).find(Boolean)
    if (hash) hashes.set(name, hash)
  }
  return hashes
}

export function normalizeRelease(payload, source) {
  const provider = PROVIDERS[source]
  const tag = payload?.tag_name
  if (!provider || typeof tag !== 'string' || !TAG.test(tag) || payload.draft || !Array.isArray(payload.assets)) {
    throw new Error('Invalid public release')
  }

  const hashes = readReleaseNotesHashes(payload.body)
  const assets = Object.create(null)
  for (const asset of payload.assets) {
    if (!asset || !isKnownAsset(asset.name)) continue
    assets[asset.name] = {
      name: asset.name,
      size: Number.isSafeInteger(asset.size) && asset.size > 0 ? asset.size : null,
      hash: normalizeHash(asset.digest) || normalizeHash(asset.hash_value) || hashes.get(asset.name) || null,
      url: provider.releases + '/download/' + encodeURIComponent(tag) + '/' + encodeURIComponent(asset.name),
    }
  }
  if (!Object.values(APK).some((name) => assets[name])) throw new Error('No Android packages in release')

  return {
    tag,
    publishedAt: typeof payload.published_at === 'string' ? payload.published_at : null,
    releaseUrl: provider.releases + '/tag/' + encodeURIComponent(tag),
    assets,
  }
}

export function releaseSnapshots() {
  return Object.fromEntries(Object.entries(publishedSnapshots).map(([source, snapshot]) => [
    source,
    normalizeRelease({
      tag_name: snapshot.tag,
      published_at: snapshot.publishedAt,
      assets: snapshot.assets.map(([name, size, digest]) => ({ name, size, digest })),
    }, source),
  ]))
}

function versionOrder(tag) {
  const [version, channel] = tag.slice(1).split('-')
  const parts = version.split('.').map(Number)
  while (parts.length < 4) parts.push(0)
  return [...parts, channel === 'Beta' ? 0 : channel === 'Force' ? 2 : 1]
}

export function compareVersions(first, second) {
  const secondOrder = versionOrder(second)
  return versionOrder(first).map((number, index) => number - secondOrder[index]).find(Boolean) || 0
}

export function preferredSource(releases) {
  return compareVersions(releases.cnb.tag, releases.github.tag) > 0 ? 'cnb' : 'github'
}

async function requestRelease(url, source, signal) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal.aborted) abort()
  signal.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, 4000)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Public release metadata unavailable')
    }
    return normalizeRelease(await response.json(), source)
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}

export async function fetchRelease(source, signal, pageUrl = window.location.href) {
  const direct = PROVIDERS[source].latest
  if (source === 'github') return requestRelease(direct, source, signal)
  try {
    return await requestRelease(new URL('./api/releases/cnb', pageUrl), source, signal)
  } catch (error) {
    if (signal.aborted) throw error
    return requestRelease(direct, source, signal)
  }
}

export function formatSize(bytes) {
  if (!bytes) return '大小待发布'
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(bytes / 1024 ** 2) + ' MB'
}
