import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const rawKey = process.env.GEMINI_API_KEY || '';
export const isGeminiConfigured = Boolean(
  rawKey &&
  rawKey !== 'your_gemini_2_5_flash_api_key_here' &&
  !rawKey.startsWith('your_')
);

if (!isGeminiConfigured) {
  console.warn('⚠️  [Gemini Config] GEMINI_API_KEY is not configured or is a placeholder. Server will operate in Heuristic fallback mode.');
}

export const ai = isGeminiConfigured
  ? new GoogleGenAI({ apiKey: rawKey })
  : null;

export const GEMINI_MODEL = 'gemini-2.5-flash';

