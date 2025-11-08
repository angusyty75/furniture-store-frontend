import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Environment-based backend configuration
  let backendPort, backendTarget, environment
  
  // Check for explicit backend URL from environment variables first
  const explicitBackend = env.VITE_BACKEND_URL || env.VITE_API_BASE_URL
  
  if (explicitBackend) {
    // Handle relative URLs for proxy configuration
    if (explicitBackend.startsWith('/api')) {
      backendTarget = 'http://localhost:8080/furniture-store'
      backendPort = '8080'
      environment = `Proxy Environment (localhost:8080 via ${explicitBackend})`
    } else {
      // Use explicit backend URL from environment (for local production)
      backendTarget = explicitBackend.replace('/api', '') // Remove /api suffix if present
      const urlObj = new URL(explicitBackend)
      backendPort = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')
      environment = `Explicit Environment (${urlObj.hostname}:${backendPort})`
    }
  } else if (mode === 'production') {
    // Default Production: Azure Container Apps → Azure MySQL (East Asia)
    backendPort = '443'
    backendTarget = 'https://furniture-backend-eastasia.yellowwater-88dd853b.eastasia.azurecontainerapps.io'
    environment = 'Production (Azure Cloud - East Asia)'
  } else {
    // Development: Port 8080 → Azure MySQL (temporarily for testing)
    backendPort = env.VITE_BACKEND_PORT || '8080'
    backendTarget = `http://localhost:${backendPort}/furniture-store`
    environment = 'Development (Azure MySQL - Testing)'
  }
  
  console.log('🔧 [VITE CONFIG] Backend Configuration:')
  console.log(`   Target: ${backendTarget}`)
  console.log(`   Environment: ${mode}`)
  console.log(`   Database: ${environment}`)
  console.log(`   Port: ${backendPort}`)
  console.log('')

  return {
    plugins: [react()],
    server: {
      // Simple cache-busting headers for development
      headers: mode === 'development' ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {},
      // No proxy in development - direct backend calls for clarity
    },
    preview: {
      port: 4173,
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      // Proxy only for preview/production builds (not development)
      proxy: mode !== 'development' ? {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/furniture-store/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err.message);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('📥 API Response:', proxyRes.statusCode, req.url);
            });
          },
        },
      } : {},
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild', // Use esbuild instead of terser for Windows compatibility
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
            // Removed 'antd' since it's not installed
          }
        }
      }
    },
  }
})
