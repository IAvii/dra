import { z } from 'zod';

import { sharedEnvSchema } from './shared';

export const httpServerEnvSchema = sharedEnvSchema.extend({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive(),
});

export type HttpServerEnv = z.infer<typeof httpServerEnvSchema>;
