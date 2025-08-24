import { Request, Response, NextFunction } from 'express';
import { PersonaService } from './app/PersonaService.js';
import { AppError } from '../../shared/errors/AppError.js';

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
      next(AppError.internal('Failed to fetch personas'));
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
        return next(AppError.notFound('Persona'));
      }

      res.json({
        success: true,
        data: persona
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch persona'));
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
        return next(AppError.badRequest('Invalid gender parameter'));
      }

      const personas = await personaService.getPersonasByGender(gender as 'male' | 'female');
      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      next(AppError.internal('Failed to fetch personas'));
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
      next(AppError.internal('Failed to fetch recommended personas'));
    }
  }
}

export const personaController = new PersonaController();