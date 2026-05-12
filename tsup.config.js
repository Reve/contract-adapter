import { defineConfig } from 'tsup';

export default defineConfig([
    {
        entry: { 'contract-adapter': 'src/index.js' },
        format: ['cjs'],
        clean: true,
        sourcemap: true,
        minify: false,
        outDir: 'dist',
        outExtension() {
            return {
                js: '.js',
            };
        },
    },
    {
        entry: { 'contract-adapter': 'src/index.js' },
        format: ['esm'],
        clean: false,
        sourcemap: true,
        minify: false,
        outDir: 'dist',
        outExtension() {
            return {
                js: '.es.js',
            };
        },
    },
]);
