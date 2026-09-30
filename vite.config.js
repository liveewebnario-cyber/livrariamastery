import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Paginas extras que vivem na raiz e precisam ir para a pasta de build (dist),
// senao nao ficam disponiveis na Vercel (ex.: /admin-dashboard.html).
const EXTRA_PAGES = ['admin-dashboard.html', 'download.html']

const copyExtraPages = () => ({
  name: 'copy-extra-pages',
  closeBundle() {
    for (const file of EXTRA_PAGES) {
      const src = resolve(process.cwd(), file)
      if (existsSync(src)) copyFileSync(src, resolve(process.cwd(), 'dist', file))
    }
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyExtraPages()],
})
