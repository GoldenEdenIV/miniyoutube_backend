import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Playlist, Video } from '../entities/index';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  // Get all playlists for a user
  async getUserPlaylists(username: string): Promise<any[]> {
    const playlists = await this.playlistRepository.find({ where: { username } });
    const playlistsWithVideos = await Promise.all(
      playlists.map(async (playlist) => {
        const videos = playlist.videoIds.length > 0 ? await this.videoRepository.find({ where: { id: In(playlist.videoIds) } }) : [];
        return { ...playlist, videos };
      })
    );
    return playlistsWithVideos;
  }

  // Get specific playlist by ID
  async getPlaylist(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({ where: { id } });
    if (!playlist) {
      throw new NotFoundException('Danh sách phát không tồn tại!');
    }
    return playlist;
  }

  // Create new playlist
  async createPlaylist(name: string, username: string): Promise<Playlist> {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Tên danh sách phát không được để trống!');
    }
    const playlist = this.playlistRepository.create({
      name: name.trim(),
      username,
      videoIds: [],
    });
    return this.playlistRepository.save(playlist);
  }

  // Update playlist name
  async updatePlaylist(id: string, name: string, username: string): Promise<Playlist> {
    const playlist = await this.getPlaylist(id);
    if (playlist.username !== username) {
      throw new ForbiddenException('Bạn không có quyền cập nhật danh sách phát này!');
    }
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Tên danh sách phát không được để trống!');
    }
    playlist.name = name.trim();
    return this.playlistRepository.save(playlist);
  }

  // Delete playlist
  async deletePlaylist(id: string, username: string): Promise<void> {
    const playlist = await this.getPlaylist(id);
    if (playlist.username !== username) {
      throw new ForbiddenException('Bạn không có quyền xóa danh sách phát này!');
    }
    await this.playlistRepository.remove(playlist);
  }

  // Add video to playlist
  async addVideoToPlaylist(id: string, videoId: string, username: string): Promise<Playlist> {
    const playlist = await this.getPlaylist(id);
    if (playlist.username !== username) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa danh sách phát này!');
    }
    if (playlist.videoIds.includes(videoId)) {
      throw new BadRequestException('Video này đã có trong danh sách phát!');
    }
    playlist.videoIds.push(videoId);
    return this.playlistRepository.save(playlist);
  }

  // Remove video from playlist
  async removeVideoFromPlaylist(id: string, videoId: string, username: string): Promise<Playlist> {
    const playlist = await this.getPlaylist(id);
    if (playlist.username !== username) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa danh sách phát này!');
    }
    const index = playlist.videoIds.indexOf(videoId);
    if (index === -1) {
      throw new NotFoundException('Video không có trong danh sách phát!');
    }
    playlist.videoIds.splice(index, 1);
    return this.playlistRepository.save(playlist);
  }
}