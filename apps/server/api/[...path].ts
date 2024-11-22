import bootstrap from '../src/main';

let cachedHandler;

export default async function handler(req, res) {
  if (!cachedHandler) {
    const app = await bootstrap();
    cachedHandler = app.getHttpAdapter().getInstance();
  }

  return cachedHandler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
