import { createServer } from 'http';
import bootstrap from '../src/main';

let cachedApp;

export default async function handler(req, res) {
  if (!cachedApp) {
    cachedApp = await bootstrap(); // Initialize the NestJS app
  }

  cachedApp(req, res); // Pass the request to the serverless handler
}

export const config = {
  api: {
    bodyParser: false,
  },
};
