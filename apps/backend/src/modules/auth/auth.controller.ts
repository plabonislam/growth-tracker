import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { AuthService } from './auth.service';

interface AuthenticatedUser {
  userId: string;
  email: string;
  isAuthority: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleLogin() {
    // Passport handles the redirect
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    if (!user) {
      // TODO: move to ConfigService
      return res.redirect('http://localhost:5173/login?error=oauth_failed');
    }
    const { accessToken, refreshToken } = this.authService.generateTokens(
      user as unknown as {
        id: string;
        email: string;
        isAuthority: boolean | null;
      },
    );
    // TODO: move to ConfigService
    return res.redirect(
      `http://localhost:5173/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Public()
  @Post('logout')
  logout() {
    return { message: 'Logged out' };
  }
}
