import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { onRequest } from '../functions/api/releases/cnb.js'

test('built pages contain complete content, metadata and hydration assets', async () => {
  for (const [file, path] of [['index', '/'], ['download', '/download']]) {
    const html = await readFile(`dist/${file}.html`, 'utf8')
    assert.match(html, /<h1[^>]*>/)
    assert.match(html, /Rolithax/)
    assert.doesNotMatch(html, /<!--app-html-->|<div id="app"[^>]*><\/div>/)
    assert.ok(html.includes(`rel="canonical" href="https://rolithax.wludy.xyz${path}"`))
    assert.match(html, /<script type="module"[^>]*src="[^"]*bundle\//)
    if (file === 'index') {
      assert.match(html, /你可能想问/)
      assert.match(html, /Android/)
      assert.match(html, /Windows/)
    } else {
      assert.match(html, /RolithaxLauncher\.apk/)
      assert.match(html, /SHA-256/)
      assert.match(html, /发布快照/)
    }
  }
})

test('only the release API can invoke a Function; no runtime renderer is published', async () => {
  const routes = JSON.parse(await readFile('dist/_routes.json', 'utf8'))
  assert.deepEqual(routes.include, ['/api/releases/cnb'])
  assert.deepEqual(routes.exclude, [])
  await assert.rejects(access('dist/_worker.js'), { code: 'ENOENT' })
  await assert.rejects(access('dist/render.js'), { code: 'ENOENT' })
})

test('legacy pages, redirects, preview indexing and 404 remain available as static assets', async () => {
  assert.equal(await readFile('dist/mobile.html', 'utf8'), await readFile('dist/index.html', 'utf8'))
  const redirects = await readFile('dist/_redirects', 'utf8')
  for (const line of [
    '/index.html / 308', '/mobile / 308', '/mobile.html / 308',
    '/download.html /download 308', '/download/ /download 308',
  ]) assert.ok(redirects.includes(line))
  assert.match(await readFile('dist/_headers', 'utf8'), /https:\/\/:project\.pages\.dev\/\*\s+X-Robots-Tag: noindex/)
  assert.match(await readFile('dist/404.html', 'utf8'), /页面不存在/)
})

test('release API preserves GET, HEAD and method restrictions', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ tag_name: 'v1.0.0', assets: [] }))
  for (const method of ['GET', 'HEAD', 'POST']) {
    const response = await onRequest({
      request: new Request('https://rolithax.wludy.xyz/api/releases/cnb', { method }),
      waitUntil() {},
    })
    assert.equal(response.status, method === 'POST' ? 405 : 200)
    if (method === 'HEAD') assert.equal(await response.text(), '')
    if (method === 'GET') assert.equal((await response.json()).tag_name, 'v1.0.0')
    if (method === 'POST') assert.equal(response.headers.get('allow'), 'GET, HEAD')
  }
})
