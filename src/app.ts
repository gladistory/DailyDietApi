import { create } from "domain";
import fastify from "fastify";
import { createUser } from "./routes/createUser/createUser";
import { register } from "module";
import { registerMeal } from "./routes/registerMeal/registerMeal";

export const app = fastify()

app.register(createUser, { prefix: '/users' });
app.register(registerMeal, { prefix: '/meals' });