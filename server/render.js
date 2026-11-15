import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import App from '../src/App.vue'

export function renderPage(page) {
  return renderToString(createSSRApp(App, { page }))
}
