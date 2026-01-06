import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // Import module vừa tạo
import { CoreModule } from './core/core.module'; // Import module vừa tạo
import { PlaylistModule } from './playlists/playlist.module'; // Import playlist module
import { AdminModule } from './admin/admin.module'; // Import admin module
import { ChannelModule } from './channels/channel.module'; // Import channel module
import { User, Video, Comment, Like, Playlist, Subscription } from './entities/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load file .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true',
      extra: { ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null },
      entities: [User, Video, Comment, Like, Playlist, Subscription],
      synchronize: true, // Tự động tạo bảng DB khi chạy
    }),
    AuthModule,
    CoreModule,
    PlaylistModule,
    AdminModule,
    ChannelModule,
  ],
})
export class AppModule {}