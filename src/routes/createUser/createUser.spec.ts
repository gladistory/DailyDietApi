import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { app } from '../../app';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

describe('Create User Route', () => {
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


    it('should be able to create a user', async () => {
        const response = await request(app.server)
            .post('/users/register')
            .send({
                name: 'Teste Create User',
                email: 'teste@gmail.com',
            })
        expect(response.statusCode).toBe(201);
    });

    it('should not be able to create a user with a existin email', async () => {

        const registerUser = await request(app.server).post('/users/register')
            .send({
                name: 'Teste Create User 01',
                email: 'teste@email.com',
            });
        expect(registerUser.statusCode).toBe(201);

        const registerUser2 = await request(app.server).post('/users/register')
            .send({
                name: 'Teste Create User 02',
                email: 'teste@email.com',
            });
        expect(registerUser2.statusCode).toBe(409);
        expect(registerUser2.body.message).toBe('Esse email já está em uso.');
    });

    it('should be able to login a user with a valid email and register the auth in database', async () => {

        const registerUser = await request(app.server).post('/users/register')
            .send({
                name: 'Teste Create User 01',
                email: 'teste@email.com',
            });
        expect(registerUser.statusCode).toBe(201);

        const loginUser = await request(app.server).post('/users/login').send({
            email: 'teste@email.com'
        });
        expect(loginUser.statusCode).toBe(200);
        expect(loginUser.body.message).toEqual('Usuário logado com sucesso.');
        expect(loginUser.body.user).toEqual({
            id: loginUser.body.user.id,
            name: loginUser.body.user.name,
            email: loginUser.body.user.email,
        });
        const setCookie = loginUser.headers['set-cookie'][0];
        const sessionId = setCookie.match(/^sessionId=([^;]+)/)?.[1];
        expect(sessionId).toEqual(loginUser.body.sessionId);

    });

    it('should be able list user information with a valid sessionId', async () => {
        await request(app.server).post('/users/register')
            .send({
                name: 'Teste Create User 01',
                email: 'teste@email.com',
            });

        const loginUser = await request(app.server).post('/users/login').send({
            email: 'teste@email.com'
        });

        const setCookie = loginUser.headers['set-cookie'][0];
        const sessionId = setCookie.match(/^sessionId=([^;]+)/)?.[1];

        const response = await request(app.server)
            .get('/users')
            .set('Cookie', [`sessionId=${sessionId}`]); // Pass cookie

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: 'Sessão válida.',
            user: {
                id: response.body.user.id,
                name: response.body.user.name,
                email: response.body.user.email,
            },
            sessionId: sessionId
        });
    });

    it.only('should be able to logout a user with a valid sessionId', async () => {

        await request(app.server).post('/users/register')
            .send({
                name: 'Teste Create User 01',
                email: 'teste@email.com',
            });

        const loginUser = await request(app.server).post('/users/login').send({
            email: 'teste@email.com'
        });

        const setCookie = loginUser.headers['set-cookie'][0];
        const sessionId = setCookie.match(/^sessionId=([^;]+)/)?.[1];

        const response = await request(app.server)
            .post('/users/logout')
            .set('Cookie', [`sessionId=${sessionId}`]);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: 'Usuário deslogado com sucesso.'
        });


    })
});