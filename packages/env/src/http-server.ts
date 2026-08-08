import { z } from 'zod';

import { sharedEnvSchema } from './shared.js';

export const httpServerEnvSchema = sharedEnvSchema.extend({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive(),
});

export type HttpServerEnv = z.infer<typeof httpServerEnvSchema>;
