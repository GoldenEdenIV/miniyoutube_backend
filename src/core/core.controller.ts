import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CoreService } from './core.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('videos')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get()
  findAll() { return this.coreService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.coreService.findOne(id); }

  @Put(':id/view')
  increaseView(@Param('id') id: string) { return this.coreService.increaseView(id); }

  // --- SỬA API UPLOAD ---
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-request')
  uploadRequest(@Body() body: { title: string; duration: string }, @Request() req) {
    // Nhận thêm body.duration truyền vào service
    return this.coreService.createUploadRequest(body.title, req.user.username, body.duration);
  }
  // ---------------------

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Chỉ Admin được xóa!');
    return this.coreService.deleteVideo(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  comment(@Param('id') id: string, @Body() body: { content: string }, @Request() req) {
    return this.coreService.addComment(id, body.content, req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/likes')
  like(@Param('id') id: string, @Body() body: { isLike: boolean }, @Request() req) {
    return this.coreService.toggleLike(id, body.isLike, req.user.username);
  }
}