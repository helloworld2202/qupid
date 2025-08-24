import { Request, Response, NextFunction } from 'express';
import { CoachService } from './app/CoachService';
import { AppError } from '../../shared/errors/AppError';

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
      next(new AppError('Failed to fetch coaches', 500));
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
        return next(new AppError('Coach not found', 404));
      }

      res.json({
        success: true,
        data: coach
      });
    } catch (error) {
      next(new AppError('Failed to fetch coach', 500));
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
      next(new AppError('Failed to fetch coaches', 500));
    }
  }
}

export const coachingController = new CoachingController();