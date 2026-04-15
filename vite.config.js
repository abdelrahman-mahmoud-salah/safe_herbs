import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Shared data injected into every Handlebars template
const siteData = {
  siteName: 'Safe Herbs & Spices',
  year: new Date().getFullYear(),
};

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),

  plugins: [
    handlebars({
      // All sub-folders inside /src/components are registered as partial namespaces
      partialDirectory: resolve(__dirname, 'src/components'),
      context: siteData,
    }),
  ],

  build: {
    outDir:     resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir:  'assets',

    rollupOptions: {
      // Multi-page: one entry per page → per-page JS/CSS bundles
      input: {
        home:               resolve(__dirname, 'src/pages/home/index.html'),
        'our-story':        resolve(__dirname, 'src/pages/our-story/index.html'),
        farms:              resolve(__dirname, 'src/pages/farms/index.html'),
        contact:            resolve(__dirname, 'src/pages/contact/index.html'),
        certificates:       resolve(__dirname, 'src/pages/certificates/index.html'),
        societal:           resolve(__dirname, 'src/pages/societal/index.html'),
        quality:            resolve(__dirname, 'src/pages/quality/index.html'),
        'safeherbs-herbs':  resolve(__dirname, 'src/pages/safeherbs-herbs/index.html'),
        'safeherbs-certs':  resolve(__dirname, 'src/pages/safeherbs-certs/index.html'),
      },
      output: {
        // Content-hash file names → CDN immutable caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Shared utilities bundled once — never duplicated across pages
        manualChunks(id) {
          if (id.includes('/scripts/utils')) return 'shared';
        },
      },
    },

    // esbuild is the fastest JS minifier (Vite default)
    minify:    'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
  },

  css: {
    devSourcemap: true,
  },
});
