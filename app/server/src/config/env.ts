import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Validation schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // GitHub
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, 'GitHub webhook secret is required'),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  GITHUB_INSTALLATION_ID: z.string().optional(),
  GITHUB_TOKEN: z.string().min(1, 'GitHub token is required'),

  // Ollama
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('codellama:13b'),
  OLLAMA_TIMEOUT: z.string().transform(Number).pipe(z.number()).default('120000'),

  // Database
  DATABASE_URL: z.string().url('Valid PostgreSQL URL required'),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // Review Settings
  DEFAULT_MODE: z.enum(['beginner', 'intermediate', 'senior']).default('beginner'),
  MAX_FILES_PER_REVIEW: z.string().transform(Number).pipe(z.number()).default('50'),
  REVIEW_TIMEOUT: z.string().transform(Number).pipe(z.number()).default('300000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number()).default('100'),

  // Feature Flags
  ENABLE_CACHING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_QUEUE: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

// Parse and validate
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\nCheck your .env file!`
      );
    }
    throw error;
  }
};

export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper to check if in production
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
