const esbuild = require('esbuild');

const buildConfig = {
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  format: 'esm',
  target: ['esnext']
};

(async () => {
  const args = process.argv.slice(2);

  if (args.includes('--watch')) {
    const buildContext = await esbuild.context(buildConfig);
    return buildContext
      .watch()
      .then(() => console.log('ESBuild is watching for changes...'))
      .catch((error) => {
        console.error('Error while watching ESBuild:', error);
        process.exit(1);
      });
  }

  esbuild.build(buildConfig).catch(() => {
    console.error('ESBuild failed to build...');
    process.exit(1)
  });
})();