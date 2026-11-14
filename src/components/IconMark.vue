<script setup>
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 19 } })

const paths = {
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  external: 'M6 18 18 6M8 6h10v10',
  down: 'M12 4v15m-6-6 6 6 6-6',
  download: 'M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM7 7h.01M7 17h.01M11 7h6m-6 10h6',
  phone: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h2',
  terminal: 'M4 5h16v14H4zM8 9l3 3-3 3m5 0h3',
  folders: 'M3 6h7l2 2h9v11H3z',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  link: 'M10 13a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-2 2m3 5a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l2-2',
  check: 'm5 12 4 4 10-10',
  network: 'M12 4v5m0 5v6M5 12h14M9 9h6v6H9zM3 10h2v4H3zm16 0h2v4h-2z',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>
