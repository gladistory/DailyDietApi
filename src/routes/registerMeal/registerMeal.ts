import { FastifyInstance } from "fastify";
import z from "zod";
import { knex } from "../../db/database";
import { checkSessionId } from "../../middleware/check-session";
import fastifyCookie from "@fastify/cookie";


export async function registerMeal(app: FastifyInstance) {

    await app.register(fastifyCookie);

    // Rota para registrar uma refeição
    app.post('/', { preHandler: checkSessionId }, async (request, reply) => {
        const registerMealBodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            data: z.string().optional(),
            hora: z.string().optional(),
            diet: z.boolean(),
        });

        const { name, description, diet, data, hora } = registerMealBodySchema.parse(request.body);

        const sessionId = request.headers['sessionid'];

        const userId = await knex('auth').where({ session_id: sessionId }).first();

        let formattedHora = hora ? `${hora.substring(0, 2)}:${hora.substring(2, 4)}` : undefined;

        try {
            await knex('meals').insert({
                id: crypto.randomUUID(),
                session_user: userId.user_id,
                name,
                description,
                data,
                hora: formattedHora || new Date().toISOString(),
                diet,
            });

            return reply.status(201).send({ message: 'Refeição resgistrada com sucesso!' });
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao registrar refeição.' });
        }

    });

    // Rota para listar as refeições do usuário
    app.get('/', { preHandler: checkSessionId }, async (request, reply) => {

        try {

            const sessionId = request.headers['sessionid'];

            const userId = await knex('auth').where({ session_id: sessionId }).first();

            const meals = await knex('meals').where({ session_user: userId.user_id }).select('*');
            // Converte diet para boolean
            const mealsFormatted = meals.map(meal => ({
                ...meal,
                diet: Boolean(meal.diet)
            }));
            return reply.status(200).send(mealsFormatted);
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao listar refeições.' });
        }
    });

    app.get('/metrics', { preHandler: checkSessionId }, async (request, reply) => {

        try {

            const sessionId = request.headers['sessionid'];


            const userId = await knex('auth').where({ session_id: sessionId }).first();

            const meals = await knex('meals').where({ session_user: userId.user_id }).select('*');
            const porcentageDietMeals = meals.length > 0
                ? Number(((meals.filter(meal => meal.diet == true).length / meals.length) * 100).toFixed(2))
                : 0;
            return reply.status(200).send({
                metrics: {
                    porcentageDietMeals,
                    totalMeals: meals.length,
                    totalDietMeals: meals.filter(meal => meal.diet == true).length,
                    totalNonDietMeals: meals.filter(meal => meal.diet == false).length,
                }
            });
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao listar métricas.' });
        }
    });

    app.get('/:id', { preHandler: checkSessionId }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = paramsSchema.parse(request.params);

        try {

            const sessionId = request.headers['sessionid'];
            const userId = await knex('auth').where({ session_id: sessionId }).first();
            
            const meal = await knex('meals').where({ id, session_user: userId.user_id }).first();

            if (!meal) {
                return reply.status(404).send({ message: 'Refeição não encontrada.' });
            }
            
            meal.diet = Boolean(meal.diet);
            return reply.status(200).send(meal);
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao buscar refeição.' });
        }
    });

    // Rota para atualizar uma refeição
    app.put('/:id', { preHandler: checkSessionId }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });

        const bodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            data: z.string().optional(),
            hora: z.string().optional(),
            diet: z.boolean().optional(),
        });

        const { id } = paramsSchema.parse(request.params);
        const { name, description, data, hora, diet } = bodySchema.parse(request.body);

        try {
            const sessionId = request.headers['sessionid'];
            const userId = await knex('auth').where({ session_id: sessionId }).first();

            const meal = await knex('meals').where({ id, session_user: userId.user_id }).first();

            if (!meal) {
                return reply.status(404).send({ message: 'Refeição não encontrada.' });
            }

            await knex('meals').where({ id }).update({
                name,
                description,
                data,
                hora,// Mantém a hora atual se não for fornecida
                diet,
            });

            return reply.status(200).send({ message: 'Refeição atualizada com sucesso!' });
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao atualizar refeição.' });
        }
    });

    // Rota para deletar uma refeição
    app.delete('/:id', { preHandler: checkSessionId }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = paramsSchema.parse(request.params);

        try {
            const sessionId = request.headers['sessionid'];
            const userId = await knex('auth').where({ session_id: sessionId }).first();

            const meal = await knex('meals').where({ id, session_user: userId.user_id }).first();

            if (!meal) {
                return reply.status(404).send({ message: 'Refeição não encontrada.' });
            }

            await knex('meals').where({ id }).delete();

            return reply.status(200).send({ message: 'Refeição deletada com sucesso!' });
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao deletar refeição.' });
        }
    });

}