import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('auth', (table) => {
        table.uuid('id').primary();
        table.string('user_id').notNullable();
        table.string('session_id').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('auth');
}

