import { FastifyInstance } from "fastify";
import z from "zod";
import { knex } from "../../db/database";
import jwt from "jsonwebtoken";
import { env } from "../../env";
import { checkSessionId } from "../../middleware/check-session";

export async function registerMeal(app: FastifyInstance) {

    app.post('/', async (request, reply) => {
        const registerMealBodySchema = z.object({
            name: z.string(),
            session_user: z.string().optional(),
            description: z.string().optional(),
            diet: z.boolean().optional(),
        });

        const { name, description, diet } = registerMealBodySchema.parse(request.body);



        await knex('meals').insert({
            id: crypto.randomUUID(),
            session_user: request.headers.authorization?.split(" ")[1] || undefined,
            name,
            description,
            diet: diet || false,
        });

        return reply.status(201).send({ message: 'Meal registered successfully' });

    });

    app.get('/', async (request, reply) => {
        const sessionId = request.headers.authorization?.split(" . ")[0];
        console.log(sessionId);

        const meals = await knex('meals')
            .select('id', 'name', 'description', 'created_at', 'diet')
            .where({ session_user: sessionId });

        if (!meals || meals.length === 0) {
            return reply.status(404).send({ message: 'No meals found for this user.' });
        }

        return reply.status(200).send(meals);
    });
}