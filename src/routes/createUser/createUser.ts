import { FastifyInstance } from "fastify";
import z from "zod";
import { knex } from "../../db/database";
import jwt from "jsonwebtoken";
import { env } from "../../env";
import { checkSessionJWT } from "../../middleware/check-session-jwt";


export async function createUser(app: FastifyInstance) {


    // Rota para criar um usuário
    app.post('/', async (request, reply) => {

        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            sessionId: z.string().optional(),
        });
        const { name, email } = createUserBodySchema.parse(request.body);

        const emailExists = await knex('user').where({ email }).first();
        if (emailExists) {
            reply.status(409).send({ message: 'Esse email já está em uso.' });
            return;
        }

        let sessionId = crypto.randomUUID();

        function generateToken() {
            return jwt.sign({ sessionId }, env.JWT_SECRET, { expiresIn: '1h' });
        }

        await knex('user').insert({
            id: crypto.randomUUID(),
            name,
            email,
            session_id: sessionId,
        });
        const token = generateToken();
        reply.header('authorization', `Bearer ${token}`);
        return reply.status(201).send({ message: 'Usuário criado com sucesso', sessionId });
    });

    // Rota para autenticar o usuário
    app.get('/', { preHandler: [checkSessionJWT] }, async (request, reply) => {

        const sessionId = request.headers.authorization?.split(" ")[1];

        const sessionIddecoded = jwt.decode(sessionId as string);

        const user = await knex('user')
            .select('id', 'name', 'email')
            .where({ session_id: (sessionIddecoded as jwt.JwtPayload).sessionId });
        if (!user || user.length === 0) {
            reply.status(404).send({ message: 'Usuário não encontrado' });
            return;
        }

        reply.status(200).send({ message: 'Usuário autenticado com sucesso', user: user[0] });
    });
}