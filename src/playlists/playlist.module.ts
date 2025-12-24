import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist, Video } from '../entities/index';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, Video])],
  providers: [PlaylistService],
  controllers: [PlaylistController],
})
export class PlaylistModule {}