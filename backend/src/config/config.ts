export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  api: {
    prefix: '/api',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ROLE_KEY || '',
  },
} as const;
