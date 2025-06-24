import { FastifyInstance } from "fastify";
import z from "zod";
import { knex } from "../../db/database";
import { checkSessionId } from "../../middleware/check-session";
import fastifyCookie from "@fastify/cookie";

export async function createUser(app: FastifyInstance) {

    await app.register(fastifyCookie);

    // Rota para criar um usuário
    app.post('/register', async (request, reply) => {

        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
        });
        const { name, email } = createUserBodySchema.parse(request.body);

        const emailExists = await knex('user').where({ email }).first();

        if (emailExists) {
            reply.status(409).send({ message: 'Esse email já está em uso.' });
            return;
        }

        // Criação do usuário e sessão automática após registro
        const userId = crypto.randomUUID();
        const sessionId = crypto.randomUUID();
        await knex('user').insert({
            id: userId,
            name: name,
            email: email,
        });
        await knex('auth').insert({
            id: crypto.randomUUID(),
            user_id: userId,
            session_id: sessionId,
            created_at: new Date(),
        });
        reply.setCookie('sessionId', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: true,
            maxAge: 60 * 60 * 24 * 7
        });
        return reply.status(201).send({
            message: 'Usuário criado e logado com sucesso.',
            user: {
                id: userId,
                name: name,
                email: email,
            },
            sessionId: sessionId
        });
    });

    // Rota para login do usuário
    app.post('/login', async (request, reply) => {

        const loginUserBodySchema = z.object({
            email: z.string().email(),
        });

        const sessionId = crypto.randomUUID();

        reply.setCookie('sessionId', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: true,
            maxAge: 60 * 60 * 24 * 7
        });

        const { email } = loginUserBodySchema.parse(request.body);

        const user = await knex('user').where({ email }).first();
        if (!user) {
            reply.status(404).send({ message: 'Usuário não encontrado.' });
            return;
        }
        else {
            await knex('auth').insert({
                id: crypto.randomUUID(),
                user_id: user.id,
                session_id: sessionId,
                created_at: new Date(),
            });
            reply.send({
                message: 'Usuário logado com sucesso.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                sessionId: sessionId
            });
        }
    });

    // Rota Para pegar dados do usuário logado
    app.get('/', { preHandler: checkSessionId }, async (request, reply) => {

        const sessionId = request.cookies.sessionId;
        const userSession = await knex('auth')
            .join('user', 'auth.user_id', 'user.id')
            .where('auth.session_id', sessionId)
            .select('user.id', 'user.name', 'user.email')
            .first();
        if (sessionId === undefined || !userSession) {
            return reply.status(404).send({ message: 'Sessão não encontrada.' });
        }

        return reply.status(200).send({
            message: 'Sessão válida.',
            user: {
                id: userSession.id,
                name: userSession.name,
                email: userSession.email,
            },
            sessionId: sessionId
        });
    });

    // Rota para logout do usuário
    app.post('/logout', { preHandler: checkSessionId }, async (request, reply) => {

        try {
            reply.clearCookie('sessionId');
        }
        catch (error) {
            return reply.status(500).send({ message: 'Erro ao deslogar usuário.' });
        }
        return reply.status(200).send({ message: 'Usuário deslogado com sucesso.' });
    });

}