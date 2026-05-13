import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — sempre necessário, carrega primeiro
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          // Radix UI
          if (id.includes('@radix-ui/')) {
            return 'vendor-radix';
          }
          // UI utils
          if (id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'vendor-ui';
          }
          // DnD Kit (pesado, só usado no admin)
          if (id.includes('@dnd-kit/')) {
            return 'vendor-dnd';
          }
          // Todo o código admin vai em chunk separado — NÃO carregado por visitantes
          if (id.includes('/src/admin/')) {
            return 'admin';
          }
        },
      },
    },
  },
});
