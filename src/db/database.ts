import { knex as setupKnex, Knex } from "knex";
import { env } from "../env";
import dotenv from "dotenv";
dotenv.config();

export const dbConfig: Knex.Config =
{
    client: env.DATABASE_CLIENT,
    connection: {
        host: env.HOST,
        port: env.PORT_DB,
        user: env.USER,
        database: env.DB_NAME,
    },
    migrations: {
        extension: 'ts',
        directory: './src/db/migrations',
    }
};

export const knex = setupKnex(dbConfig);