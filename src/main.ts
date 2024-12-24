import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, //tranforma la data
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Documentacion de la lading page de la UPSRJ')
    .setDescription('El sistema realiza la creacion de usuarios, asi como el control de los tipos de permisos')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000); 
  logger.log(`The Backend is running in ${process.env.PORT}`)

}
bootstrap();
