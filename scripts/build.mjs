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
await build({
  configFile: false,
  publicDir: false,
  plugins: [
    vue(),
    {
      name: 'html-templates',
      resolveId(id) {
        if (id === 'virtual:templates') return '\0templates'
      },
      load(id) {
        if (id === '\0templates')
          return `export default ${JSON.stringify(templates)}`
      },
    },
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  ssr: { target: 'webworker', noExternal: true },
  build: {
    ssr: 'server/worker.js',
    outDir: 'dist',
    emptyOutDir: false,
    minify: true,
    rolldownOptions: { output: { entryFileNames: '_worker.js' } },
  },
})
const { renderPage } = await import('../dist/_worker.js')
await writeFile('dist/index.html', await renderPage('home'))
await writeFile('dist/download.html', await renderPage('download'))
await writeFile('dist/mobile.html', await renderPage('home'))
console.log('Worker SSR bundle and rendered HTML fallbacks ready.')
