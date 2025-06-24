import { FastifyRequest, FastifyReply } from "fastify";
import { knex } from "../db/database";


export async function checkSessionId(
    request: FastifyRequest,
    reply: FastifyReply
) {

    const sessionId = request.cookies.sessionId;

    if (!sessionId || sessionId === '') {
        return reply.status(401).send({ mensagem: 'Sessão inválida, token não encontrado' });
    }

    try {
        const validSession = await knex('user').where('session_id', sessionId).first()
        if (validSession?.session_id === sessionId) {
            return reply.status(200).send({ mensagem: 'Token válido!' });
        }
    }
    catch (error) {
        return reply.status(500).send({ mensagem: 'Erro ao verificar sessão, token inválido' });
    }


}


