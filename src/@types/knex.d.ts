import { Kenx } from "knex";


declare module "knex/types/tables" {
    export interface Tables {
        user: {
            id: string;
            name: string;
            email?: string;
            session_id?: string;
            created_at: string;
        };

        meals: {
            id: string;
            name: string;
            description?: string;
            diet?: boolean;
            data?: string;
            session_user?: string;
            created_at: string;
        };
    }
}