import { Request, Response, NextFunction } from 'express';
import { UserService } from './app/UserService';
import { AppError } from '../../shared/errors/AppError';

const userService = new UserService();

export class UserController {
  /**
   * GET /api/v1/users/:id
   * 사용자 프로필 조회
   */
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await userService.getUserProfile(id);
      
      if (!profile) {
        return next(new AppError('User not found', 404));
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(new AppError('Failed to fetch user profile', 500));
    }
  }

  /**
   * POST /api/v1/users
   * 사용자 프로필 생성
   */
  async createUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.createUserProfile(req.body);
      
      if (!profile) {
        return next(new AppError('Failed to create user profile', 400));
      }

      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(new AppError('Failed to create user profile', 500));
    }
  }

  /**
   * PUT /api/v1/users/:id
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await userService.updateUserProfile(id, req.body);
      
      if (!profile) {
        return next(new AppError('Failed to update user profile', 400));
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(new AppError('Failed to update user profile', 500));
    }
  }

  /**
   * POST /api/v1/users/:id/tutorial/complete
   * 튜토리얼 완료 처리
   */
  async completeTutorial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await userService.completeTutorial(id);
      
      if (!success) {
        return next(new AppError('Failed to complete tutorial', 400));
      }

      res.json({
        success: true,
        message: 'Tutorial completed successfully'
      });
    } catch (error) {
      next(new AppError('Failed to complete tutorial', 500));
    }
  }

  /**
   * GET /api/v1/users/:id/favorites
   * 즐겨찾기 목록 조회
   */
  async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const favorites = await userService.getFavorites(id);
      
      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      next(new AppError('Failed to fetch favorites', 500));
    }
  }

  /**
   * POST /api/v1/users/:id/favorites/:personaId
   * 즐겨찾기 토글
   */
  async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, personaId } = req.params;
      const success = await userService.toggleFavorite(id, personaId);
      
      if (!success) {
        return next(new AppError('Failed to toggle favorite', 400));
      }

      res.json({
        success: true,
        message: 'Favorite toggled successfully'
      });
    } catch (error) {
      next(new AppError('Failed to toggle favorite', 500));
    }
  }
}

export const userController = new UserController();