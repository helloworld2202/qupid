import { Request, Response } from 'express';
import { PersonaGenerationService } from './app/PersonaGenerationService.js';
import { AppError } from '../../shared/errors/AppError.js';

export class PersonaController {
  private personaGenerationService: PersonaGenerationService;

  constructor() {
    this.personaGenerationService = new PersonaGenerationService();
  }

  /**
   * 사용자 관심사 기반 페르소나 생성
   */
  generatePersonaForUser = async (req: Request, res: Response) => {
    try {
      const { userGender, userInterests, isTutorial } = req.body;

      if (!userGender || !['male', 'female'].includes(userGender)) {
        throw AppError.badRequest('유효한 성별을 선택해주세요.');
      }

      if (!Array.isArray(userInterests)) {
        throw AppError.badRequest('관심사는 배열 형태여야 합니다.');
      }

      const persona = await this.personaGenerationService.generatePersonaForUser(
        userGender,
        userInterests,
        isTutorial || false
      );

      res.json({
        success: true,
        data: persona
      });
    } catch (error) {
      console.error('Generate persona error:', error);
      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '페르소나 생성 중 오류가 발생했습니다.'
        });
      }
    }
  };

  /**
   * 매일 새로운 페르소나들 생성
   */
  generateDailyPersonas = async (req: Request, res: Response) => {
    try {
      const { userGender, count = 5 } = req.body;

      if (!userGender || !['male', 'female'].includes(userGender)) {
        throw AppError.badRequest('유효한 성별을 선택해주세요.');
      }

      const personas = await this.personaGenerationService.generateDailyPersonas(
        userGender,
        count
      );

      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      console.error('Generate daily personas error:', error);
      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '일일 페르소나 생성 중 오류가 발생했습니다.'
        });
      }
    }
  };

  /**
   * 특정 페르소나 상세 정보 조회
   */
  getPersonaById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw AppError.badRequest('페르소나 ID가 필요합니다.');
      }

      // TODO: 데이터베이스에서 페르소나 조회
      // 현재는 임시로 에러 반환
      res.status(404).json({
        success: false,
        message: '페르소나를 찾을 수 없습니다.'
      });
    } catch (error) {
      console.error('Get persona error:', error);
      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '페르소나 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  /**
   * 사용자별 추천 페르소나 목록 조회
   */
  getRecommendedPersonas = async (req: Request, res: Response) => {
    try {
      const { userId, userGender, limit = 10 } = req.query;

      if (!userGender || !['male', 'female'].includes(userGender as string)) {
        throw AppError.badRequest('유효한 성별을 선택해주세요.');
      }

      // TODO: 사용자 선호도 기반 추천 로직 구현
      // 현재는 임시로 일일 페르소나 생성
      const personas = await this.personaGenerationService.generateDailyPersonas(
        userGender as 'male' | 'female',
        parseInt(limit as string) || 10
      );

      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      console.error('Get recommended personas error:', error);
      if (error instanceof AppError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '추천 페르소나 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };
}