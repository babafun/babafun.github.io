import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  base: '/', // Adjust for subdirectory deployment
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser', // Aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          // Note: Uncomment when WASM bindings are created in Phase 2
          // 'wasm-core': ['./src/wasm/bindings'],
        },
      },
    },
  },
  optimizeDeps: {
    // Note: Uncomment when WASM bindings are created in Phase 2
    // exclude: ['./src/wasm/bindings'], // Don't pre-bundle WASM
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
    },
  },
});
