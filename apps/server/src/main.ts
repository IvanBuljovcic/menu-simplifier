// apps/server/src/main.ts
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://menu-simplifier.vercel.app/', process.env.NEXT_PUBLIC_API_URL] // Update with your client domain
      : ['http://localhost:3001'],
    credentials: true
  });

  await app.init();
  
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  bootstrap().then(async () => {
    const app = await NestFactory.create(AppModule);
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};