import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from "vite-plugin-svgr";
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm';  // For GitHub-flavored Markdown support

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx({ 
      remarkPlugins: [remarkGfm],
      include: /\.mdx?$/
    }), 
    react(), 
    svgr()],
  build: {
    rollupOptions: {
      output: {
        // manualChunks: (id, meta) => {
        //   console.log(id, meta);
        //   return "chunk";
        // }
      }
    }
  }
})
