import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { app } from '../../app';
import request from 'supertest';
import { execSync } from 'node:child_process';
import jwt from 'jsonwebtoken';

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

    it('should create a new user successfully', async () => {
        const createUserResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'John Doe',
                email: 'john.doe@example.com',
            });
        expect(createUserResponse.status).toBe(201);
    });

    it('should not create a user with an existing email', async () => {
        await request(app.server)
            .post('/users')
            .send({
                name: 'John Doe',
                email: 'john.doe@example.com',
            });
        const response = await request(app.server)
            .post('/users')
            .send({
                name: 'John Doe 2',
                email: 'john.doe@example.com',
            });
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('message', 'Esse email já está em uso.');
    });

    it.only('should be able get the user authenticated', async () => {
        const createUserResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'John Doe',
                email: 'john.doe@example.com',
            });
        expect(createUserResponse.status).toBe(201);

        const sessionId = createUserResponse.headers.authorization?.split(" ")[1];

        const getUserAuthenticatedResponse = await request(app.server)
            .get('/users')
            .set('Authorization', `Bearer ${sessionId}`);
        expect(getUserAuthenticatedResponse.status).toBe(200);
        expect(getUserAuthenticatedResponse.body).toHaveProperty('user');
        expect(getUserAuthenticatedResponse.body.user).toHaveProperty('id');
    });
});
