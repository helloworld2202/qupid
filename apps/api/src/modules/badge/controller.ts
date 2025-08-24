import { Request, Response, NextFunction } from 'express';
import { BadgeService } from './app/BadgeService.js';

export class BadgeController {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService();
  }

  getAllBadges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const badges = await this.badgeService.getAllBadges();
      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      next(error);
    }
  };

  getUserBadges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const badges = await this.badgeService.getUserBadges(userId);
      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      next(error);
    }
  };

  awardBadge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { badgeId } = req.body;
      
      await this.badgeService.awardBadge(userId, badgeId);
      
      res.json({
        success: true,
        message: 'Badge awarded successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}