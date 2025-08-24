import { Request, Response, NextFunction } from 'express';
import { PersonaService } from './app/PersonaService';
import { AppError } from '../../shared/errors/AppError';

const personaService = new PersonaService();

export class PersonaController {
  /**
   * GET /api/v1/personas
   * 모든 페르소나 조회
   */
  async getAllPersonas(req: Request, res: Response, next: NextFunction) {
    try {
      const personas = await personaService.getAllPersonas();
      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      next(new AppError('Failed to fetch personas', 500));
    }
  }

  /**
   * GET /api/v1/personas/:id
   * 특정 페르소나 조회
   */
  async getPersonaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const persona = await personaService.getPersonaById(id);
      
      if (!persona) {
        return next(new AppError('Persona not found', 404));
      }

      res.json({
        success: true,
        data: persona
      });
    } catch (error) {
      next(new AppError('Failed to fetch persona', 500));
    }
  }

  /**
   * GET /api/v1/personas/gender/:gender
   * 성별로 페르소나 필터링
   */
  async getPersonasByGender(req: Request, res: Response, next: NextFunction) {
    try {
      const { gender } = req.params;
      
      if (gender !== 'male' && gender !== 'female') {
        return next(new AppError('Invalid gender parameter', 400));
      }

      const personas = await personaService.getPersonasByGender(gender as 'male' | 'female');
      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      next(new AppError('Failed to fetch personas', 500));
    }
  }

  /**
   * GET /api/v1/personas/recommended
   * 추천 페르소나 조회
   */
  async getRecommendedPersonas(req: Request, res: Response, next: NextFunction) {
    try {
      const { userGender = 'male', limit = '5' } = req.query;
      const personas = await personaService.getRecommendedPersonas(
        userGender as string,
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      next(new AppError('Failed to fetch recommended personas', 500));
    }
  }
}

export const personaController = new PersonaController();