import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/NumSolve/', 
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/images/*',
          dest: 'images'
        }
      ]
    })
  ]
});
