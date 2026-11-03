import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom/client', '@tiptap/react', '@tiptap/starter-kit'] },
  server: {
    host: 'localhost', port: 1420, strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  build: { target: ['es2022', 'safari15'] },
});
