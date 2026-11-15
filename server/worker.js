import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import App from '../src/App.vue'
import templates from 'virtual:templates'
import { onRequestGet } from '../functions/api/releases/cnb.js'

const site = 'https://rolithax.wludy.xyz'
export async function renderPage(page) {
  const body = await renderToString(createSSRApp(App, { page }))
  return templates[page === 'download' ? 'download' : 'index'].replace(
    '<!--app-html-->',
    () => body,
  )
}

const securityHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'public, max-age=0, s-maxage=300',
  'X-Rolithax-Render': 'vue-ssr',
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (!['GET', 'HEAD'].includes(request.method))
      return new Response('Method not allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      })
    if (url.pathname === '/api/releases/cnb') {
      const response = await onRequestGet({
        request,
        waitUntil: (task) => ctx.waitUntil(task),
      })
      return request.method === 'HEAD' ? new Response(null, response) : response
    }
    const aliases = {
      '/index.html': '/',
      '/mobile': '/',
      '/mobile.html': '/',
      '/download.html': '/download',
      '/download/': '/download',
    }
    if (aliases[url.pathname])
      return Response.redirect(
        new URL(aliases[url.pathname] + url.search, url.origin),
        308,
      )
    const page =
      url.pathname === '/'
        ? 'home'
        : url.pathname === '/download'
          ? 'download'
          : null
    if (!page) return env.ASSETS.fetch(request)
    try {
      const headers = {
        ...securityHeaders,
        Link: `<${site}${page === 'home' ? '/' : '/download'}>; rel="canonical"`,
      }
      if (url.hostname.endsWith('.pages.dev'))
        headers['X-Robots-Tag'] = 'noindex'
      return new Response(
        request.method === 'HEAD' ? null : await renderPage(page),
        { headers },
      )
    } catch {
      console.error('Page rendering failed')
      const fallback = await env.ASSETS.fetch(
        new Request(
          new URL(page === 'download' ? '/download' : '/', url.origin),
        ),
      )
      if (!fallback.ok)
        return new Response('Temporarily unavailable', {
          status: 503,
          headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
        })
      return new Response(request.method === 'HEAD' ? null : fallback.body, {
        headers: {
          ...securityHeaders,
          'Cache-Control': 'no-store',
          'X-Rolithax-Render': 'prerender-fallback',
        },
      })
    }
  },
}
