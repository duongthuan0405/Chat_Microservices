import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  // Cấu hình Proxy để giải quyết lỗi CORS và Self-signed SSL
  server: {
    proxy: {
      '/api': {
        target: 'https://20.196.144.168',
        changeOrigin: true,
        secure: false, // Bỏ qua lỗi SSL (net::ERR_CERT_AUTHORITY_INVALID)
      },
      '/hubs': {
        target: 'https://20.196.144.168',
        changeOrigin: true,
        secure: false,
        ws: true, // Hỗ trợ WebSockets (SignalR)
      },
      '/grafana': {
        target: 'https://20.196.144.168',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
