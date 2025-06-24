import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('meals', (table) => {
        table.string('data').after('session_user').notNullable().defaultTo('');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('meals', (table) => {
        table.dropColumn('data');
    });
}

