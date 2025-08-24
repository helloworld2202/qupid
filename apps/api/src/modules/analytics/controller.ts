import { Request, Response } from 'express';
import AnalyticsService from './app/AnalyticsService.js';
import { AppError } from '../../shared/errors/AppError.js';

const analyticsService = new AnalyticsService();

export const analyticsController = {
  async getPerformanceData(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        throw new AppError('사용자 ID가 필요합니다', 400);
      }

      const performanceData = await analyticsService.getUserPerformanceData(userId);
      
      res.json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error('Performance data error:', error);
      if (error instanceof AppError) {
        res.status(error.status || 500).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: '성과 데이터를 가져오는데 실패했습니다'
        });
      }
    }
  },

  async getWeeklyStats(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { startDate, endDate } = req.query;

      if (!userId) {
        throw new AppError('사용자 ID가 필요합니다', 400);
      }

      // 주간 통계 로직 (추후 구현)
      const weeklyStats = {
        totalConversations: 0,
        averageScore: 0,
        topCategory: '',
        improvement: 0
      };

      res.json({
        success: true,
        data: weeklyStats
      });
    } catch (error) {
      console.error('Weekly stats error:', error);
      res.status(500).json({
        success: false,
        error: '주간 통계를 가져오는데 실패했습니다'
      });
    }
  },

  async getMonthlyStats(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { month, year } = req.query;

      if (!userId) {
        throw new AppError('사용자 ID가 필요합니다', 400);
      }

      // 월간 통계 로직 (추후 구현)
      const monthlyStats = {
        totalConversations: 0,
        averageScore: 0,
        badgesEarned: 0,
        levelProgress: 0
      };

      res.json({
        success: true,
        data: monthlyStats
      });
    } catch (error) {
      console.error('Monthly stats error:', error);
      res.status(500).json({
        success: false,
        error: '월간 통계를 가져오는데 실패했습니다'
      });
    }
  }
};