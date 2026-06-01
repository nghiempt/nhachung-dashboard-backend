import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

function device(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới (tự động tạo profile)' })
  signUp(@Body() dto: SignUpDto, @Req() req: Request) {
    return this.auth.signUp(dto, device(req));
  }

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Đăng nhập' })
  signIn(@Body() dto: SignInDto, @Req() req: Request) {
    return this.auth.signIn(dto, device(req));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới access token' })
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, device(req));
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất thiết bị hiện tại' })
  logout(@CurrentUser('sessionId') sessionId: string) {
    return this.auth.logout(sessionId);
  }
}
