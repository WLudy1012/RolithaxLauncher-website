import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import worker, { renderPage } from '../dist/_worker.js'
const ctx = { waitUntil() {} }
const env = {
  ASSETS: { fetch: async () => new Response('not found', { status: 404 }) },
}

test('users, Googlebot and Bingbot receive identical complete SSR documents', async () => {
  for (const path of ['/', '/download']) {
    const bodies = []
    for (const userAgent of ['Mozilla/5.0', 'Googlebot/2.1', 'bingbot/2.0']) {
      const response = await worker.fetch(
        new Request('https://rolithax.wludy.xyz' + path, {
          headers: { 'User-Agent': userAgent },
        }),
        env,
        ctx,
      )
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('x-rolithax-render'), 'vue-ssr')
      const html = await response.text()
      assert.match(html, /<h1[^>]*>/)
      assert.match(html, /Rolithax/)
      assert.doesNotMatch(html, /<!--app-html-->|<div id="app"[^>]*><\/div>/)
      assert.match(html, /rel="canonical"/)
      if (path === '/') {
        assert.match(html, /你可能想问/)
        assert.match(html, /Android/)
        assert.match(html, /Windows/)
      } else {
        assert.match(html, /RolithaxLauncher\.apk/)
        assert.match(html, /SHA-256/)
        assert.match(html, /发布快照/)
      }
      bodies.push(html)
    }
    assert.equal(new Set(bodies).size, 1)
  }
})

test('legacy aliases redirect to canonical documents and retain queries', async () => {
  for (const [path, canonical] of [
    ['/index.html', '/'],
    ['/mobile.html', '/'],
    ['/mobile', '/'],
    ['/download.html', '/download'],
    ['/download/', '/download'],
  ]) {
    const response = await worker.fetch(
      new Request('https://rolithax.wludy.xyz' + path + '?from=test'),
      env,
      ctx,
    )
    assert.equal(response.status, 308)
    assert.equal(
      response.headers.get('location'),
      'https://rolithax.wludy.xyz' + canonical + '?from=test',
    )
  }
})

test('HEAD has no body, preview domains are noindex, unknown pages remain 404', async () => {
  const response = await worker.fetch(
    new Request('https://preview.pages.dev/', { method: 'HEAD' }),
    env,
    ctx,
  )
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex')
  assert.equal(await response.text(), '')
  assert.equal(
    (
      await worker.fetch(
        new Request('https://rolithax.wludy.xyz/unknown'),
        env,
        ctx,
      )
    ).status,
    404,
  )
  assert.equal(
    (
      await worker.fetch(
        new Request('https://rolithax.wludy.xyz/', { method: 'POST' }),
        env,
        ctx,
      )
    ).status,
    405,
  )
})

test('static fallbacks contain the same rendered body as the Worker', async () => {
  for (const [file, page] of [
    ['index', 'home'],
    ['download', 'download'],
    ['mobile', 'home'],
  ]) {
    assert.equal(
      await readFile(`dist/${file}.html`, 'utf8'),
      await renderPage(page),
    )
  }
})
