import { Request, Response, NextFunction } from 'express';
import { AuthService } from './app/AuthService.js';
import { SocialAuthService } from './app/SocialAuthService.js';
import { AppError } from '../../shared/errors/AppError.js';

export class AuthController {
  private authService: AuthService;
  private socialAuthService: SocialAuthService;

  constructor() {
    this.authService = new AuthService();
    this.socialAuthService = new SocialAuthService();
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, user_gender, partner_gender } = req.body;

      // 기본 유효성 검사
      if (!email || !password || !name || !user_gender || !partner_gender) {
        throw AppError.badRequest('Missing required fields');
      }

      if (password.length < 6) {
        throw AppError.badRequest('Password must be at least 6 characters');
      }

      const result = await this.authService.signup({
        email,
        password,
        name,
        user_gender,
        partner_gender
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw AppError.badRequest('Email and password are required');
      }

      const result = await this.authService.login({ email, password });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logout();

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.authService.getSession();

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw AppError.badRequest('Refresh token is required');
      }

      const result = await this.authService.refreshToken(refresh_token);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw AppError.badRequest('Email is required');
      }

      await this.authService.resetPassword(email);

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { password } = req.body;

      if (!password || password.length < 6) {
        throw AppError.badRequest('Password must be at least 6 characters');
      }

      await this.authService.updatePassword(password);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // 소셜 로그인 URL 생성
  getSocialLoginUrls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const urls = {
        kakao: this.socialAuthService.getKakaoLoginUrl(),
        naver: this.socialAuthService.getNaverLoginUrl(),
        google: this.socialAuthService.getGoogleLoginUrl(),
      };

      res.json({
        success: true,
        data: urls
      });
    } catch (error) {
      next(error);
    }
  };

  // 카카오 로그인 콜백
  kakaoCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        throw AppError.badRequest('Authorization code is required');
      }

      const result = await this.socialAuthService.kakaoLogin(code);

      // 프론트엔드로 리다이렉트 (토큰 포함)
      const frontendUrl = `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/auth/callback?token=${result.session.access_token}&refresh_token=${result.session.refresh_token}`;
      res.redirect(frontendUrl);
    } catch (error) {
      next(error);
    }
  };

  // 네이버 로그인 콜백
  naverCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.query;

      if (!code || typeof code !== 'string') {
        throw AppError.badRequest('Authorization code is required');
      }

      const result = await this.socialAuthService.naverLogin(code, state as string);

      // 프론트엔드로 리다이렉트 (토큰 포함)
      const frontendUrl = `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/auth/callback?token=${result.session.access_token}&refresh_token=${result.session.refresh_token}`;
      res.redirect(frontendUrl);
    } catch (error) {
      next(error);
    }
  };

  // 구글 로그인 콜백
  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        throw AppError.badRequest('Authorization code is required');
      }

      const result = await this.socialAuthService.googleLogin(code);

      // 프론트엔드로 리다이렉트 (토큰 포함)
      const frontendUrl = `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/auth/callback?token=${result.session.access_token}&refresh_token=${result.session.refresh_token}`;
      res.redirect(frontendUrl);
    } catch (error) {
      next(error);
    }
  };
}