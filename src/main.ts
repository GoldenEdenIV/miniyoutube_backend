import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CẤU HÌNH CORS (GIỮ NGUYÊN) ---
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- SỬA LẠI ĐOẠN NÀY ---
  // Lấy cổng từ Azure (process.env.PORT), nếu không có (chạy ở máy) thì mới dùng 3000
  const port = process.env.PORT || 3000; 
  
  // Thêm '0.0.0.0' để lắng nghe từ mọi IP (quan trọng cho Docker/Cloud)
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();