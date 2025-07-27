import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('meals', (table) => {
        table.string('hora').after('data').notNullable().defaultTo('');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('meals', (table) => {
        table.dropColumn('hora');
    });
}
