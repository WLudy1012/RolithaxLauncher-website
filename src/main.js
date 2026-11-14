import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const root = document.querySelector('#app')
createApp(App, { page: root.dataset.page }).mount(root)

if (location.hash) {
  try {
    const anchor = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (anchor) requestAnimationFrame(() => anchor.scrollIntoView())
  } catch {
    // An invalid fragment does not affect navigation.
  }
}
