
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
    configFile: false,

    plugins: [
        react(),
        tailwindcss(),
    ],

    publicDir: 'netlify-public',

    build: {
        outDir: 'netlify-dist',
        emptyOutDir: true,

        rollupOptions: {
            input: resolve(process.cwd(), 'index.html'),
        },
    },
});
