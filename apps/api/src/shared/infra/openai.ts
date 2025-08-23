import OpenAI from 'openai';
import { env } from '../config/env.js';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

export const defaultModel = 'gpt-4o-mini';
export const imageModel = 'dall-e-3';