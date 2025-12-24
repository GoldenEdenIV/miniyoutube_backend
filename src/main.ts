import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- THÊM DÒNG NÀY ĐỂ MỞ KHÓA CORS ---
  app.enableCors({
    origin: '*', // Cho phép tất cả các trang web gọi vào (Hoặc để 'http://localhost:5173')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // -------------------------------------

  await app.listen(3000);
}
bootstrap();