import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** Normalize line endings from Gemini responses. */
const normalizeLineEndings = (text) => {
  if (!text) return '';
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Models tried in priority order. Falls back on 503 / overload errors.
 */
const MODEL_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.5-pro',
];

/**
 * Call Gemini API with automatic model fallback on overload.
 * @param {string} prompt
 * @returns {Promise<string>} Generated text (normalized)
 */
const generateContent = async (prompt) => {
  let lastError = null;

  for (const modelName of MODEL_PRIORITY) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return normalizeLineEndings(response.text());
      } catch (err) {
        lastError = err;
        const msg = String(err?.message || '');
        const isOverloaded = msg.includes('503') || msg.includes('Service Unavailable');

        if (!isOverloaded) throw err;

        if (attempt < 2) await sleep(800);
      }
    }

    console.warn(`⚠️  Gemini model ${modelName} overloaded, trying fallback…`);
  }

  throw lastError;
};

export default generateContent;
