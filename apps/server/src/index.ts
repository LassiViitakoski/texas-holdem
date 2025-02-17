import { buildApp } from './app';

(async () => {
  const app = await buildApp();
  const { PORT = 3000 } = process.env;

  try {
    await app.listen({ port: Number(PORT) });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
