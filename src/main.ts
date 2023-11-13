import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // estos 2 siguientes sirven para transformar datos de entrada en las request a lo que define su tipo de TS
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  const port = process.env.PORT
  await app.listen(port);
  console.log(`App running on port ${port}`)
}
bootstrap();
