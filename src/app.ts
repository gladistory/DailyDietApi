import { create } from "domain";
import fastify from "fastify";
import { createUser } from "./routes/createUser/createUser";

export const app = fastify()

app.register(createUser, { prefix: '/users' });