import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
    ],
    define: {
      'process.env': JSON.stringify({
        REACT_APP_TOKEN_PRIVATE_REPO: env.REACT_APP_TOKEN_PRIVATE_REPO,
        REACT_APP_POKEGO_BREEZE_DB_URL: env.REACT_APP_POKEGO_BREEZE_DB_URL,
        REACT_APP_EDGE_CONFIG: env.REACT_APP_EDGE_CONFIG,
        REACT_APP_DEPLOYMENT_MODE: env.REACT_APP_DEPLOYMENT_MODE,
        REACT_APP_ENCRYPTION_KEY: env.REACT_APP_ENCRYPTION_KEY,
        REACT_APP_ENCRYPTION_SALT: env.REACT_APP_ENCRYPTION_SALT,
        REACT_APP_VERSION: env.REACT_APP_VERSION,
        REACT_APP_CONFIG: env.REACT_APP_CONFIG,
        REACT_APP_BASE_URL: env.REACT_APP_BASE_URL,
        REACT_APP_NEON_API_URL: env.NEON_API_URL,
        NODE_ENV: JSON.stringify(isDev ? 'development' : 'production'),
        DEBUG: isDev,
      }),
      global: 'globalThis',
      'process.browser': true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        process: 'process/browser',
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: isDev,
      minify: isDev ? false : 'terser',
      target: 'es2015',
      cssMinify: !isDev,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'utility-vendor': ['lodash', 'moment'],
            'bootstrap-vendor': ['react-bootstrap'],
            'router-vendor': ['react-router-dom'],
            'redux-vendor': ['react-redux', 'redux', 'redux-persist', 'redux-thunk'],
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
          chunkFileNames: 'static/js/[name].[hash].js',
          entryFileNames: 'static/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return 'static/css/[name].[hash].[ext]';
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name || '')) {
              return 'static/media/[name].[hash].[ext]';
            }
            return 'static/[ext]/[name].[hash].[ext]';
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
        },
        mangle: {
          safari10: true,
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${resolve(__dirname, 'src/assets/styles/variables.scss')}" as *;`,
          // Modern Sass API
          sourceMap: isDev,
          quietDeps: true,
          logger: {
            warn: (message: string | string[]) => {
              // Suppress specific Sass deprecation warnings
              if (message.includes('Deprecation Warning: The legacy JS API')) {
                return;
              }
            },
          },
        },
      },
      devSourcemap: isDev,
    },
    server: {
      port: 9000,
      host: '0.0.0.0',
      open: false,
      strictPort: true,
      hmr: {
        overlay: true,
        port: 9001,
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-redux',
        'redux',
        'redux-persist',
        'redux-thunk',
        'lodash',
        'moment',
        'react-bootstrap',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
        'crypto-js',
        'localforage',
        'crypto-browserify',
        'stream-browserify',
        'buffer',
        'util',
        'process',
      ],
      exclude: ['@vercel/analytics', '@vercel/speed-insights'],
    },
    envPrefix: 'REACT_APP_',
  };
});
