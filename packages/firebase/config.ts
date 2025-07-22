import { defineSecret } from 'firebase-functions/lib/params';
const geminiAPIKeySecret = defineSecret('GEMINI_API_KEY');

export const config = {
  geminiAPIKey:  geminiAPIKeySecret.value(),
  geminiModel: 'gemini-pro',
  contextWindowDays: 1,
  maxSuggestionLength: 100,
};