import { Request, Response, NextFunction } from 'express';
import { AuthService } from './app/AuthService';
import { AppError } from '../../shared/errors/AppError';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, user_gender, partner_gender } = req.body;

      // 기본 유효성 검사
      if (!email || !password || !name || !user_gender || !partner_gender) {
        throw new AppError('Missing required fields', 400);
      }

      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
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
        throw new AppError('Email and password are required', 400);
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
        throw new AppError('Refresh token is required', 400);
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
        throw new AppError('Email is required', 400);
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
        throw new AppError('Password must be at least 6 characters', 400);
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
}