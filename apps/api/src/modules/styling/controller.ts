import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StylingService } from './app/StylingService.js';

const stylingService = new StylingService();

const getStylingAdviceSchema = z.object({
  prompt: z.string().min(1).max(500)
});

export const getStylingAdvice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = getStylingAdviceSchema.parse(req.body);
    
    const result = await stylingService.getStylingAdvice(prompt);
    
    res.json({
      ok: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};