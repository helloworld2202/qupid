import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';

const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
if (!anonKey) {
  throw new Error('Missing Supabase anon key');
}

const supabase = createClient(env.SUPABASE_URL, anonKey);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    metadata?: Record<string, any>;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata
    };

    next();
  } catch (error) {
    next(error);
  }
};