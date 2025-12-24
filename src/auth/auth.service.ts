import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/index';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    // 1. Validate input
    if (!username || !password) {
      throw new BadRequestException('Tên đăng nhập và mật khẩu không được để trống!');
    }

    if (username.length < 3) {
      throw new BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự!');
    }

    if (password.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự!');
    }

    // 2. Validate username format (alphanumeric + underscore)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new BadRequestException('Tên đăng nhập chỉ có thể chứa chữ, số và dấu gạch dưới!');
    }

    // 3. Check if username already exists
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại!');
    }

    // 4. Prevent registering as 'admin'
    if (username.toLowerCase() === 'admin') {
      throw new BadRequestException('Không thể đăng ký tài khoản với tên "admin"!');
    }

    // 5. Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create new user
    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      role: 'USER', // Always create as USER role
    });

    await this.userRepo.save(user);

    // 7. Return success message (not sensitive data)
    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      username: user.username,
    };
  }

  async login(username: string, password: string) {
    // 1. Validate input
    if (!username || !password) {
      throw new UnauthorizedException('Tên đăng nhập và mật khẩu không được để trống!');
    }

    // 2. Find user
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu!');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu!');
    }

    // 4. Generate JWT token
    const payload = {
      username: user.username,
      role: user.role,
      sub: user.id,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '24h', // Token expires in 24 hours
    });

    // 5. Return token and user info
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      expiresIn: 86400, // 24 hours in seconds
    };
  }

  // Optional: Validate token
  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ!');
    }
  }

  // Optional: Get user info from token
  getUserFromToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      };
    } catch (err) {
      return null;
    }
  }
}