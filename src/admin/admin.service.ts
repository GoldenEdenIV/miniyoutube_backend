import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Video, Comment, Like } from '../entities/index';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
  ) {}

  // ========== USER MANAGEMENT ==========

  // Get all users
  async getAllUsers() {
    const users = await this.userRepo.find();
    return users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
    }));
  }

  // Get single user
  async getUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return { id: user.id, username: user.username, role: user.role };
  }

  // Create new user (admin only)
  async createUser(username: string, password: string, role: string = 'USER') {
    // Validate input
    if (!username || !password) {
      throw new BadRequestException('Tên đăng nhập và mật khẩu không được để trống!');
    }

    if (username.length < 3) {
      throw new BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự!');
    }

    if (password.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự!');
    }

    // Validate role
    if (!['USER', 'ADMIN'].includes(role)) {
      throw new BadRequestException('Role phải là USER hoặc ADMIN');
    }

    // Check if username exists
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại!');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      role,
    });

    await this.userRepo.save(user);

    return { id: user.id, username: user.username, role: user.role, message: 'Tạo user thành công' };
  }

  // Update user (change password, role)
  async updateUser(id: string, data: { password?: string; role?: string }) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');

    if (data.password) {
      if (data.password.length < 6) {
        throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự!');
      }
      user.password = await bcrypt.hash(data.password, 10);
    }

    if (data.role) {
      if (!['USER', 'ADMIN'].includes(data.role)) {
        throw new BadRequestException('Role phải là USER hoặc ADMIN');
      }
      user.role = data.role;
    }

    await this.userRepo.save(user);
    return { id: user.id, username: user.username, role: user.role, message: 'Cập nhật user thành công' };
  }

  // Delete user (admin only)
  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');

    if (user.username === 'admin') {
      throw new ForbiddenException('Không thể xóa admin account');
    }

    await this.userRepo.delete(id);
    return { message: `Xóa user ${user.username} thành công` };
  }

  // Change user role
  async changeUserRole(id: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');

    if (!['USER', 'ADMIN'].includes(role)) {
      throw new BadRequestException('Role phải là USER hoặc ADMIN');
    }

    if (user.username === 'admin' && role !== 'ADMIN') {
      throw new ForbiddenException('Không thể thay đổi role của admin account');
    }

    user.role = role;
    await this.userRepo.save(user);
    return { id: user.id, username: user.username, role: user.role, message: 'Cập nhật role thành công' };
  }

  // ========== VIDEO MANAGEMENT ==========

  // Get all videos
  async getAllVideos() {
    const videos = await this.videoRepo.find({ relations: ['comments', 'likes'] });
    return videos.map(video => ({
      id: video.id,
      title: video.title,
      uploader: video.uploader,
      status: video.status,
      views: video.views,
      duration: video.duration,
      createdAt: video.createdAt,
      likes: video.likes.filter(l => l.isLike).length,
      dislikes: video.likes.filter(l => !l.isLike).length,
      comments: video.comments.length,
    }));
  }

  // Get video details
  async getVideoDetails(id: string) {
    const video = await this.videoRepo.findOne({
      where: { id },
      relations: ['comments', 'likes'],
    });

    if (!video) throw new NotFoundException('Video không tồn tại');

    const likes = video.likes.filter(l => l.isLike);
    const dislikes = video.likes.filter(l => !l.isLike);

    return {
      id: video.id,
      title: video.title,
      uploader: video.uploader,
      status: video.status,
      views: video.views,
      duration: video.duration,
      streamingUrl: video.streamingUrl,
      createdAt: video.createdAt,
      stats: {
        likes: likes.length,
        dislikes: dislikes.length,
        comments: video.comments.length,
      },
      comments: video.comments.map(c => ({
        id: c.id,
        username: c.username,
        content: c.content,
        createdAt: c.createdAt,
      })),
      likesDislikes: {
        likes: likes.map(l => l.username),
        dislikes: dislikes.map(l => l.username),
      },
    };
  }

  // Update video (title, status)
  async updateVideo(id: string, data: { title?: string; status?: string }) {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    if (data.title) {
      video.title = data.title;
    }

    if (data.status) {
      if (!['PENDING', 'PROCESSING', 'READY', 'FAILED'].includes(data.status)) {
        throw new BadRequestException('Status không hợp lệ');
      }
      video.status = data.status;
    }

    await this.videoRepo.save(video);
    return { id: video.id, title: video.title, status: video.status, message: 'Cập nhật video thành công' };
  }

  // Delete video
  async deleteVideo(id: string) {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    await this.videoRepo.delete(id);
    return { message: `Xóa video "${video.title}" thành công` };
  }

  // Delete comment from video
  async deleteComment(id: string) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment không tồn tại');

    await this.commentRepo.delete(id);
    return { message: 'Xóa comment thành công' };
  }
}
