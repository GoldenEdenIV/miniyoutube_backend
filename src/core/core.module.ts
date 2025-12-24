import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video, Comment, Like } from '../entities/index';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Comment, Like])],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {}