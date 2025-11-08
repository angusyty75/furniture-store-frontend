// config.js for AI
export const config = {
  ai: {
    apiBaseUrl: process.env.REACT_APP_AI_API_BASE_URL || '/api',
    enabled: process.env.REACT_APP_AI_ENABLED !== 'false',
    defaultLanguage: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en'
  }
};