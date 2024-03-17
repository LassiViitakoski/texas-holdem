const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    minify: false,
    format: 'esm',
    target: ['esnext'],
    platform: 'node',
    packages: 'external'
  })
  .catch(() => process.exit(1));