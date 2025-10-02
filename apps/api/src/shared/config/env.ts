import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173').transform(
    (val) => val.split(',').map(origin => origin.trim())
  ),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);