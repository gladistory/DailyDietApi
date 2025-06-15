import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { knex } from "../db/database";


export async function checkSessionJWT(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const token = request.headers.authorization?.split(" ")[1];


    // Verifica se o token está presente
    if (!token) {
        reply.status(401).send({ message: "Token não fornecido" });
        return;
    }

    const sessionIdDecoded = jwt.decode(token);

    // Verifica se o token foi decodificado corretamente
    let sessionId: string | undefined;
    if (typeof sessionIdDecoded === "object" && sessionIdDecoded !== null && "sessionId" in sessionIdDecoded) {
        sessionId = (sessionIdDecoded as jwt.JwtPayload).sessionId as string;

        const sessionIdExist = await knex('user').where({ session_id: sessionId }).first();

        if (!sessionId || sessionId !== sessionIdExist?.session_id) {
            reply.status(401).send({ message: "Token inválido" });
            return;
        }
    }
    else {
        reply.status(401).send({ message: "Token inválido" });
        return;
    }

}

