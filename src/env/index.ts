import z from 'zod';
import { config } from 'dotenv';

if (process.env.NODE_ENV === "test") {
    config({
        path: ".env.test",
    });
} else {
    config();
}

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3333),
    PORT_DB: z.coerce.number().default(3606),
    HOST: z.string().default("localhost"),
    DB_NAME: z.string(),
    USER: z.string().default("root"),
    DATABASE_CLIENT: z.enum(["mysql2", "pg"]).default("mysql2"),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
    console.error("Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const env = _env.data;