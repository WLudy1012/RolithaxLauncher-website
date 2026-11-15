import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFile, writeFile } from 'node:fs/promises'

await build()
const templates = Object.fromEntries(
  await Promise.all(
    ['index', 'download'].map(async (name) => [
      name,
      await readFile(`dist/${name}.html`, 'utf8'),
    ]),
  ),
)
const renderer = await build({
  configFile: false,
  publicDir: false,
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  ssr: { target: 'webworker', noExternal: true },
  build: {
    ssr: 'server/render.js',
    outDir: 'dist',
    emptyOutDir: false,
    write: false,
    minify: true,
  },
})
const entry = renderer.output.find((item) => item.type === 'chunk' && item.isEntry)
const { renderPage } = await import(
  `data:text/javascript;base64,${Buffer.from(entry.code).toString('base64')}`
)
for (const [name, page] of [['index', 'home'], ['download', 'download']]) {
  const body = await renderPage(page)
  const html = templates[name].replace('<!--app-html-->', () => body)
  await writeFile(`dist/${name}.html`, html)
  if (page === 'home') await writeFile('dist/mobile.html', html)
}
console.log('Static HTML ready. Only the release API uses Pages Functions.')
