
import fastify from "fastify";
import { createUser } from "./routes/createUser/createUser";
import { registerMeal } from "./routes/registerMeal/registerMeal";

import fastifyCors from '@fastify/cors';


export const app = fastify();

app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(createUser, { prefix: '/users' });
app.register(registerMeal, { prefix: '/meals' });