import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5216,http://localhost:6216")
    .split(",")
    .map((origin) => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8216);
  await app.listen(port);
}

bootstrap();
