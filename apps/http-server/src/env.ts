import { httpServerEnvSchema } from '@draw/env/http-server';

export const env = httpServerEnvSchema.parse(process.env);
