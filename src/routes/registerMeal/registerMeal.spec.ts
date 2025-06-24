import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { app } from '../../app';
import request from 'supertest';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { knex } from '../../db/database';

describe('Register Meal Routes', () => {
    let sessionId: string;
    let userId: string;

    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        execSync('npx knex migrate:rollback --all');
    });

    beforeEach(() => {
        execSync('npx knex migrate:rollback');
        execSync('npx knex migrate:latest');
    });

    // Helper para criar usuário e sessão
    async function createUserAndSession() {
        const userRes = await request(app.server)
            .post('/users/register')
            .send({
                name: 'User Test',
                email: `user${Math.random()}@mail.com`,
            });
        expect(userRes.statusCode).toBe(201);

        userId = userRes.body?.id || undefined;
        sessionId = crypto.randomUUID();
        // Insere session_id na tabela user
        await knex('user').update({ session_id: sessionId }).where({ email: userRes.body?.email || 'user@mail.com' });
        // Insere na tabela auth
        await knex('auth').insert({ id: crypto.randomUUID(), user_id: userId, session_id: sessionId });
        return sessionId;
    }

    it('deve registrar uma refeição com sucesso', async () => {
        const sessionId = await createUserAndSession();
        const response = await request(app.server)
            .post('/meals')
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({
                name: 'Almoço',
                description: 'Arroz e feijão',
                data: '2025-06-24',
                diet: true,
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Refeição resgistrada com sucesso!');
    });

    it('deve listar refeições do usuário', async () => {
        const sessionId = await createUserAndSession();
        await request(app.server)
            .post('/meals')
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Jantar', diet: false });
        const response = await request(app.server)
            .get('/meals')
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve buscar uma refeição por id', async () => {
        const sessionId = await createUserAndSession();
        const postRes = await request(app.server)
            .post('/meals')
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Café', diet: true });
        expect(postRes.statusCode).toBe(201);
        // Busca id da refeição inserida
        const listRes = await request(app.server)
            .get('/meals')
            .set('Cookie', [`sessionId=${sessionId}`]);
        const mealId = listRes.body[0]?.id;
        const getRes = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.id).toBe(mealId);
    });

    it('deve atualizar uma refeição', async () => {
        const sessionId = await createUserAndSession();
        await request(app.server)
            .post('/meals')
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Lanche', diet: false });
        const listRes = await request(app.server)
            .get('/meals')
            .set('Cookie', [`sessionId=${sessionId}`]);
        const mealId = listRes.body[0]?.id;
        const putRes = await request(app.server)
            .put(`/meals/${mealId}`)
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Lanche Atualizado', diet: true });
        expect(putRes.statusCode).toBe(200);
        expect(putRes.body.message).toBe('Refeição atualizada com sucesso!');
    });

    it('deve deletar uma refeição', async () => {
        const sessionId = await createUserAndSession();
        await request(app.server)
            .post('/meals')
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Ceia', diet: false });
        const listRes = await request(app.server)
            .get('/meals')
            .set('Cookie', [`sessionId=${sessionId}`]);
        const mealId = listRes.body[0]?.id;
        const delRes = await request(app.server)
            .delete(`/meals/${mealId}`)
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(delRes.statusCode).toBe(200);
        expect(delRes.body.message).toBe('Refeição deletada com sucesso!');
    });

    it('deve retornar erro ao registrar refeição sem sessão', async () => {
        const response = await request(app.server)
            .post('/meals')
            .send({ name: 'Sem sessão', diet: true });
        expect(response.statusCode).toBe(401);
    });

    it('deve retornar erro ao buscar refeição inexistente', async () => {
        const sessionId = await createUserAndSession();
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request(app.server)
            .get(`/meals/${fakeId}`)
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Refeição não encontrada.');
    });

    it('deve retornar erro ao atualizar refeição inexistente', async () => {
        const sessionId = await createUserAndSession();
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request(app.server)
            .put(`/meals/${fakeId}`)
            .set('Cookie', [`sessionId=${sessionId}`])
            .send({ name: 'Update Fail' });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Refeição não encontrada.');
    });

    it('deve retornar erro ao deletar refeição inexistente', async () => {
        const sessionId = await createUserAndSession();
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request(app.server)
            .delete(`/meals/${fakeId}`)
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Refeição não encontrada.');
    });
});

