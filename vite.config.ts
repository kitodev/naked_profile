// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'   // ← This is the correct one
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'   // Recommended

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteTsconfigPaths(),           // Helps with @/ aliases
    tanstackStart(),
    viteReact(),                   // Must come after tanstackStart
  ],
})
