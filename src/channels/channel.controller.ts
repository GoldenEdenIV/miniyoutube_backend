import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChannelService } from './channel.service';

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  // Get channel info (public)
  @Get(':username')
  getChannelInfo(@Param('username') username: string) {
    return this.channelService.getChannelInfo(username);
  }

  // Check if user subscribed to channel (requires auth)
  @UseGuards(JwtAuthGuard)
  @Get(':username/subscription')
  checkSubscription(
    @Param('username') channel: string,
    @Request() req: any,
  ) {
    return this.channelService.checkSubscription(req.user.username, channel);
  }

  // Subscribe to channel (requires auth)
  @UseGuards(JwtAuthGuard)
  @Post(':username/subscribe')
  subscribe(@Param('username') channel: string, @Request() req: any) {
    return this.channelService.subscribe(req.user.username, channel);
  }

  // Unsubscribe from channel (requires auth)
  @UseGuards(JwtAuthGuard)
  @Delete(':username/subscribe')
  unsubscribe(@Param('username') channel: string, @Request() req: any) {
    return this.channelService.unsubscribe(req.user.username, channel);
  }

  // Get subscriber count (public)
  @Get(':username/subscribers')
  getSubscriberCount(@Param('username') channel: string) {
    return this.channelService.getSubscriberCount(channel);
  }
}
