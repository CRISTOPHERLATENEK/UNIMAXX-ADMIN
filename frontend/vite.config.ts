import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'admin': [
            './src/admin/Dashboard',
            './src/admin/AdminLayout',
            './src/admin/SolutionsManager',
            './src/admin/SolutionPagesManager',
            './src/admin/BannersManager',
            './src/admin/ContentManager',
            './src/admin/SegmentsManager',
            './src/admin/StatsManager',
            './src/admin/HelpCenterManager',
            './src/admin/QuickLinksManager',
            './src/admin/Settings',
          ],
        },
      },
    },
  },
});
