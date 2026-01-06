import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Middleware để kiểm tra admin
  private checkAdmin(req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ admin có quyền truy cập');
    }
  }

  // ========== USER ENDPOINTS ==========

  @Get('users')
  getAllUsers(@Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.getUser(id);
  }

  @Post('users')
  createUser(
    @Body() body: { username: string; password: string; role?: string },
    @Request() req: any,
  ) {
    this.checkAdmin(req);
    return this.adminService.createUser(body.username, body.password, body.role);
  }

  @Put('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { password?: string; role?: string },
    @Request() req: any,
  ) {
    this.checkAdmin(req);
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.deleteUser(id);
  }

  @Put('users/:id/role')
  changeUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
    @Request() req: any,
  ) {
    this.checkAdmin(req);
    return this.adminService.changeUserRole(id, body.role);
  }

  // ========== VIDEO ENDPOINTS ==========

  @Get('videos')
  getAllVideos(@Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.getAllVideos();
  }

  @Get('videos/:id')
  getVideoDetails(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.getVideoDetails(id);
  }

  @Put('videos/:id')
  updateVideo(
    @Param('id') id: string,
    @Body() body: { title?: string; status?: string },
    @Request() req: any,
  ) {
    this.checkAdmin(req);
    return this.adminService.updateVideo(id, body);
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.deleteVideo(id);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.deleteComment(id);
  }
}
