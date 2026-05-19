import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from '@nabla/vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
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
      // ESLint: dev-only — CI runs `npm run lint` as a dedicated step before build
      ...(isDev
        ? [
            eslint({
              eslintOptions: { cache: true },
              shouldLint: (path) =>
                path.includes('/src/') &&
                /\.(ts|tsx|js|jsx)$/.test(path) &&
                !path.includes('node_modules') &&
                !path.includes('dist') &&
                !path.includes('build') &&
                !path.includes('.spec.') &&
                !path.includes('.test.'),
            }),
            stylelint({
              include: ['src/**/*.{css,scss}'],
              exclude: ['node_modules', 'dist', 'build'],
              build: false,
              lintInWorker: false,
              cache: true,
            }),
          ]
        : []),
    ],
    define: {
      'process.env': JSON.stringify({
        // All REACT_APP_* keys from .env — add new vars to .env only, they are picked up automatically
        ...Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith('REACT_APP_'))),
        // Build-time constants derived from Vite mode — not user-configurable via .env
        NODE_ENV: isDev ? 'development' : 'production',
        DEBUG: isDev,
      }),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        process: 'process/browser',
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
        events: 'events',
        vm: 'vm-browserify',
      },
      dedupe: ['styled-components'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isDev ? false : 'terser',
      target: 'es2015',
      cssMinify: !isDev,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'EVAL' && warning.id?.includes('vm-browserify')) {
            return;
          }
          warn(warning);
        },
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
            'utility-vendor': ['lodash', 'moment'],
            'router-vendor': ['react-router-dom', 'history'],
            'redux-vendor': ['react-redux', 'redux', 'redux-persist', 'redux-thunk', '@redux-devtools/extension'],
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            'data-vendor': ['react-data-table-component', 'styled-components', 'react-xarrows'],
            'storage-vendor': ['localforage', 'immutability-helper'],
            'api-vendor': ['axios'],
            'crypto-vendor': ['crypto-js', 'dompurify'],
            'hooks-vendor': ['usehooks-ts', 'react-device-detect'],
          },
          chunkFileNames: 'static/js/[name].[hash].js',
          entryFileNames: 'static/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names[0] ?? '';
            if (/\.(css)$/.test(name)) {
              return 'static/css/[name].[hash].[ext]';
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(name)) {
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
          additionalData: `@use "${resolve(__dirname, 'src/assets/styles/variables.scss').replace(/\\/g, '/')}" as *;`,
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
        'events',
        'vm-browserify',
        'styled-components',
        'shallowequal',
        'react-data-table-component',
        'react-xarrows',
      ],
      exclude: [
        '@vercel/analytics',
        '@vercel/speed-insights',
        '@vercel/edge-config',
        '@vercel/postgres',
        '@redux-devtools/extension',
        'dompurify',
      ],
    },
    envPrefix: 'REACT_APP_',
  };
});
