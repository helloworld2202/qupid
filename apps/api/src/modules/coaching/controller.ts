import { Request, Response, NextFunction } from 'express';
import { CoachService } from './app/CoachService.js';
import { AppError } from '../../shared/errors/AppError.js';

const coachService = new CoachService();

export class CoachingController {
  /**
   * GET /api/v1/coaches
   * 모든 코치 조회
   */
  async getAllCoaches(req: Request, res: Response, next: NextFunction) {
    try {
      const coaches = await coachService.getAllCoaches();
      res.json({
        success: true,
        data: coaches
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch coaches'));
    }
  }

  /**
   * GET /api/v1/coaches/:id
   * 특정 코치 조회
   */
  async getCoachById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coach = await coachService.getCoachById(id);
      
      if (!coach) {
        return next(AppError.notFound('Coach'));
      }

      res.json({
        success: true,
        data: coach
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch coach'));
    }
  }

  /**
   * GET /api/v1/coaches/specialty/:specialty
   * 전문 분야로 코치 필터링
   */
  async getCoachesBySpecialty(req: Request, res: Response, next: NextFunction) {
    try {
      const { specialty } = req.params;
      const coaches = await coachService.getCoachesBySpecialty(specialty);
      
      res.json({
        success: true,
        data: coaches
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch coaches'));
    }
  }
}

export const coachingController = new CoachingController();