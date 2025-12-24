import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlaylistService } from './playlist.service';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  // Get user's playlists (public)
  @Get('user/:username')
  async getUserPlaylists(@Param('username') username: string) {
    const playlists = await this.playlistService.getUserPlaylists(username);
    return { success: true, data: playlists };
  }

  // Get specific playlist (public)
  @Get(':id')
  async getPlaylist(@Param('id') id: string) {
    const playlist = await this.playlistService.getPlaylist(id);
    return { success: true, data: playlist };
  }

  // Create new playlist (requires auth)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPlaylist(@Body() body: { name: string }, @Request() req) {
    const playlist = await this.playlistService.createPlaylist(body.name, req.user.username);
    return { success: true, message: 'Danh sách phát đã được tạo!', data: playlist };
  }

  // Update playlist name (requires auth and ownership)
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updatePlaylist(@Param('id') id: string, @Body() body: { name: string }, @Request() req) {
    const playlist = await this.playlistService.updatePlaylist(id, body.name, req.user.username);
    return { success: true, message: 'Danh sách phát đã được cập nhật!', data: playlist };
  }

  // Delete playlist (requires auth and ownership)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deletePlaylist(@Param('id') id: string, @Request() req) {
    await this.playlistService.deletePlaylist(id, req.user.username);
    return { success: true, message: 'Danh sách phát đã bị xóa!' };
  }

  // Add video to playlist (requires auth and ownership)
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/videos')
  async addVideoToPlaylist(@Param('id') id: string, @Body() body: { videoId: string }, @Request() req) {
    const playlist = await this.playlistService.addVideoToPlaylist(id, body.videoId, req.user.username);
    return { success: true, message: 'Video đã được thêm vào danh sách phát!', data: playlist };
  }

  // Remove video from playlist (requires auth and ownership)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/videos/:videoId')
  async removeVideoFromPlaylist(@Param('id') id: string, @Param('videoId') videoId: string, @Request() req) {
    const playlist = await this.playlistService.removeVideoFromPlaylist(id, videoId, req.user.username);
    return { success: true, message: 'Video đã được xóa khỏi danh sách phát!', data: playlist };
  }
}