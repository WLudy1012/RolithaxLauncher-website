const source = 'https://cnb.cool/WLudy/RolithaxLauncher/-/releases/latest'
const limit = 1024 * 1024

async function readRelease(response) {
  if (!response.ok) throw new Error('Upstream HTTP ' + response.status)
  if (!response.body || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid upstream content')
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let text = ''
  let length = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > limit) throw new Error('Upstream response too large')
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

async function getRelease({ request, waitUntil }) {
  const cache = globalThis.caches?.default
  const key = new Request(new URL('/api/releases/cnb', request.url))
  const cached = await cache?.match(key).catch(() => undefined)
  if (cached) return cached

  try {
    const upstream = await fetch(source, {
      headers: { Accept: 'application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(7_000),
    })
    const release = await readRelease(upstream)
    if (typeof release?.tag_name !== 'string' || !Array.isArray(release.assets)) {
      throw new Error('Invalid release')
    }
    const response = Response.json({
      tag_name: release.tag_name,
      name: release.name,
      published_at: release.published_at,
      draft: release.draft,
      prerelease: release.prerelease,
      assets: release.assets.map((asset) => ({
        name: asset?.name,
        size: asset?.size,
        hash_value: asset?.hash_value,
        brower_download_url: asset?.brower_download_url ?? asset?.browser_download_url,
      })),
    }, { headers: { 'Cache-Control': 'public, max-age=180' } })
    if (cache) waitUntil(cache.put(key, response.clone()).catch(() => {}))
    return response
  } catch (error) {
    console.warn('CNB release metadata:', error instanceof Error ? error.message : 'request failed')
    return Response.json({ error: 'Release metadata unavailable' }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}

export async function onRequest(context) {
  const { method } = context.request
  if (!['GET', 'HEAD'].includes(method)) {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    })
  }
  const response = await getRelease(context)
  return method === 'HEAD' ? new Response(null, response) : response
}
