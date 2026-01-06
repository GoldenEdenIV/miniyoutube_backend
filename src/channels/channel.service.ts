import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Video, Subscription } from '../entities/index';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
  ) {}

  // Get channel info
  async getChannelInfo(username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Kênh không tồn tại');
    }

    // Get channel videos
    const videos = await this.videoRepo.find({
      where: { uploader: username, status: 'READY' },
      order: { createdAt: 'DESC' },
    });

    // Calculate stats
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const subscriberCount = await this.subscriptionRepo.count({
      where: { channel: username },
    });

    return {
      username,
      videoCount: videos.length,
      totalViews,
      subscriberCount,
      videos,
    };
  }

  // Subscribe to channel
  async subscribe(subscriber: string, channel: string) {
    if (subscriber === channel) {
      throw new BadRequestException('Không thể theo dõi chính mình');
    }

    // Check if channel exists
    const channelUser = await this.userRepo.findOne({ where: { username: channel } });
    if (!channelUser) {
      throw new NotFoundException('Kênh không tồn tại');
    }

    // Check if already subscribed
    const existing = await this.subscriptionRepo.findOne({
      where: { subscriber, channel },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã theo dõi kênh này');
    }

    const subscription = this.subscriptionRepo.create({ subscriber, channel });
    await this.subscriptionRepo.save(subscription);

    return { message: 'Đã theo dõi kênh', subscribed: true };
  }

  // Unsubscribe from channel
  async unsubscribe(subscriber: string, channel: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { subscriber, channel },
    });

    if (!subscription) {
      throw new NotFoundException('Bạn chưa theo dõi kênh này');
    }

    await this.subscriptionRepo.remove(subscription);
    return { message: 'Đã hủy theo dõi', subscribed: false };
  }

  // Check if user subscribed to channel
  async checkSubscription(subscriber: string, channel: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { subscriber, channel },
    });

    return { subscribed: !!subscription };
  }

  // Get subscriber count for channel
  async getSubscriberCount(channel: string) {
    const count = await this.subscriptionRepo.count({
      where: { channel },
    });
    return { subscriberCount: count };
  }
}
