import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, Comment, Like } from '../entities/index';
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

@Injectable()
export class CoreService {
  constructor(
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
  ) {}

  findAll() { return this.videoRepo.find({ order: { createdAt: 'DESC' } }); }

  async findOne(id: string) {
    return this.videoRepo.findOne({
      where: { id },
      relations: ['comments', 'likes'],
      order: { comments: { createdAt: 'DESC' } }
    });
  }

  async increaseView(id: string) {
    const video = await this.videoRepo.findOneBy({ id });
    if (video) { video.views += 1; await this.videoRepo.save(video); }
    return { success: true };
  }

  // --- SỬA HÀM NÀY ---
  async createUploadRequest(title: string, username: string, duration: string) {
    // Lưu duration vào DB
    const video = await this.videoRepo.save(this.videoRepo.create({ 
      title, 
      uploader: username, 
      duration: duration || '00:00', // Nếu ko có thì để mặc định
      views: 0,
      status: 'PENDING' 
    }));
    
    // Azure SAS Logic (Giữ nguyên)
    const account = process.env.AZURE_STORAGE_ACCOUNT!;
    const accountKey = process.env.AZURE_STORAGE_KEY!;
    const creds = new StorageSharedKeyCredential(account, accountKey);
    const expiresOn = new Date(); expiresOn.setMinutes(expiresOn.getMinutes() + 60);
    
    const sasToken = generateBlobSASQueryParameters({
      containerName: process.env.AZURE_CONTAINER_RAW!, 
      blobName: `${video.id}.mp4`, 
      permissions: BlobSASPermissions.parse("w"), 
      expiresOn
    }, creds).toString();

    return { uploadUrl: `https://${account}.blob.core.windows.net/${process.env.AZURE_CONTAINER_RAW!}/${video.id}.mp4?${sasToken}` };
  }
  // -------------------

  deleteVideo(id: string) { return this.videoRepo.delete(id); }

  addComment(videoId: string, content: string, username: string) {
    return this.commentRepo.save(this.commentRepo.create({ content, username, video: { id: videoId } }));
  }

  async toggleLike(videoId: string, isLike: boolean, username: string) {
    const existing = await this.likeRepo.findOne({ where: { video: { id: videoId }, username } });
    if (existing) { existing.isLike = isLike; return this.likeRepo.save(existing); }
    return this.likeRepo.save(this.likeRepo.create({ isLike, username, video: { id: videoId } }));
  }
}