import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

// VND money fields use Prisma BigInt; serialise them as JSON numbers
// (all amounts are well within Number.MAX_SAFE_INTEGER).
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this as unknown as bigint);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Cap JSON / urlencoded payloads. File uploads go through multipart (multer
  // enforces its own 10MB limit), so request bodies here only carry metadata.
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // Reject unexpected body fields instead of silently dropping them, so
      // typos / stale clients surface as a clear 400 rather than a no-op.
      forbidNonWhitelisted: true,
    }),
  );

  const origins = (config.get<string>('CORS_ORIGINS', '') || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const isProd = config.get<string>('NODE_ENV') === 'production';
  app.enableCors({
    // In dev, allow any localhost/127.0.0.1 port (Next picks 3000/3001/3002…).
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl / same-origin / server-to-server
      if (origins.includes(origin)) return cb(null, true);
      if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }
      return cb(origins.length ? new Error('Not allowed by CORS') : null, !origins.length);
    },
    credentials: true,
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nhà Chung API')
    .setDescription('Resident / building management API (Dashboard + Cá nhân scope)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  Logger.log(`🚀 API ready at http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
  Logger.log(`📚 Swagger at http://localhost:${port}/${apiPrefix}/docs`, 'Bootstrap');
}
bootstrap();
