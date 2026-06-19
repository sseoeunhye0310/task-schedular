import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // 새 버전 배포 시 즉시 이전 캐시 교체
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Firestore API 캐시 (네트워크 우선, 실패시 캐시)
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' },
          },
        ],
      },
      manifest: {
        name: '업무 스케줄러',
        short_name: '스케줄러',
        description: '은하수님의 업무 스케줄러',
        theme_color: '#1A3557',
        background_color: '#f5f7fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
      },
    },
  },
})
