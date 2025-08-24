import { Request, Response, NextFunction } from 'express';
import { UserService } from './app/UserService.js';
import { AppError } from '../../shared/errors/AppError.js';

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
        return next(AppError.notFound('User'));
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch user profile'));
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
        return next(AppError.badRequest('Failed to create user profile'));
      }

      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(AppError.internal('Failed to create user profile'));
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
        return next(AppError.badRequest('Failed to update user profile'));
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(AppError.internal('Failed to update user profile'));
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
        return next(AppError.badRequest('Failed to complete tutorial'));
      }

      res.json({
        success: true,
        message: 'Tutorial completed successfully'
      });
    } catch (error) {
      next(AppError.internal('Failed to complete tutorial'));
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
      next(AppError.internal('Failed to fetch favorites'));
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
        return next(AppError.badRequest('Failed to toggle favorite'));
      }

      res.json({
        success: true,
        message: 'Favorite toggled successfully'
      });
    } catch (error) {
      next(AppError.internal('Failed to toggle favorite'));
    }
  }
}

export const userController = new UserController();