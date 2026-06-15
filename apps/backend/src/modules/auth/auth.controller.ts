import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { AuthService } from './auth.service';

interface AuthenticatedUser {
  userId: string;
  email: string;
  isAuthority: boolean;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleLogin() {
    // Passport handles the redirect
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback — redirects to frontend with tokens',
  })
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

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { example: { refreshToken: 'your-refresh-token' } } })
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout — client clears tokens from localStorage' })
  logout() {
    return { message: 'Logged out' };
  }
}
