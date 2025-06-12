import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.uuid('session_id').index();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user');
}