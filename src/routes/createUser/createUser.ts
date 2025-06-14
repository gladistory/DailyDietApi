import { FastifyInstance } from "fastify";
import z from "zod";
import { knex } from "../../db/database";


export async function createUser(app: FastifyInstance) {
    app.post('/', async (request, reply) => {

        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            session_id: z.string().optional(),
        });
        const { name, email, session_id } = createUserBodySchema.parse(request.body);

        const emailExists = await knex('user').where({ email }).first();
        if (emailExists) {
            reply.status(409).send({ message: 'Esse email já está em uso.' });
            return;
        }

        const user = await knex('user').insert({
            id: crypto.randomUUID(),
            name,
            email,
            session_id
        });
        reply.status(201).send();
    });
}