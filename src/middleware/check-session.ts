import { FastifyRequest, FastifyReply } from "fastify";
import { knex } from "../db/database";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49";


export async function checkSessionId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const sessionId = request.cookies.sessionId;
    const validSession = await knex('user').where('session_id', sessionId).first()
    if (!sessionId || !validSession) {
        return reply.status(401).send({ mensagem: 'Sessão inválida' });
    }

    if (validSession?.session_id === sessionId) {
        return reply.status(200).send({ mensagem: 'Sessão válida' });
    }
}


