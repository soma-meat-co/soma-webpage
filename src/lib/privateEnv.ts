import { z } from 'zod';

export const envSchema = z.object ({
    SUPABASE_SECRET_KEY: z.string().min(1),
});

export const privateEnv = envSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
}); 