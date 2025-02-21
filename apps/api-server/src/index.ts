import { buildApp } from './app';

(async () => {
  console.log('Starting API server...');
  const app = await buildApp();
  const { PORT = 3000 } = process.env;

  try {
    await app.listen({ port: Number(PORT) });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
