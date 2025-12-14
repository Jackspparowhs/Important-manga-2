import react from '@vitejs/plugin-react';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path'; // <--- ADDED THIS

import { pluginExposeRenderer } from './vite.base.config.js';

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<'renderer'>;
    const { root, mode, forgeConfigSelf, command } = forgeEnv;
    const name = forgeConfigSelf.name ?? '';

    const userConfig: UserConfig = {
        root,
        mode,
        base: './',
        build: {
            outDir: `.vite/renderer/${name}`,
            chunkSizeWarningLimit: Infinity,
            rollupOptions: {
                onwarn(warning, warn) {
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
                    warn(warning);
                },
            },
        },
        plugins: [tsconfigPaths(), pluginExposeRenderer(name), react()],
        resolve: {
            preserveSymlinks: true,
            alias: {
                // <--- ADDED THIS BLOCK
                src: path.resolve(__dirname, 'src'),
            },
        },
        clearScreen: false,
        esbuild:
            command === 'build'
                ? {
                      drop: ['console', 'debugger'],
                  }
                : {},
    };

    return userConfig;
});
