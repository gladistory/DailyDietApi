## Documentação Técnica da API
### Autenticação
O sistema utiliza sessões recebida no headers da requisição. O middleware `check-session` valida a sessão do usuário em rotas protegidas.

## Tecnologias Utilizadas
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática ao projeto.

## Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute as migrations:
   ```bash
   npx knex migrate:latest
   ```

3. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```

---

## Como Executar os Testes Automatizados

1. Execute todos os testes:
   ```bash
   npm run test
   ```

---
- **Fastify**: Framework web rápido e eficiente para APIs REST.
- **MySQL** (padrão, pode ser adaptado para outros bancos via Knex).
- **Vitest**: Framework de testes automatizados.

---

## Arquitetura e Estrutura do Projeto

O projeto segue uma arquitetura modular, separando responsabilidades em diferentes camadas:

- `src/routes/`: Rotas organizadas por contexto (ex: criação de usuário, registro de refeições).
- `src/db/`: Configuração do banco de dados e migrations.
- `src/middleware/`: Middlewares de autenticação e validação de sessão.
- `src/env/`: Configuração de variáveis de ambiente.
- `src/@types/`: Tipagens customizadas para o projeto.

O uso de middlewares permite validação centralizada de sessão e autenticação, garantindo segurança nas rotas protegidas. As migrations facilitam o versionamento e evolução do banco de dados.

Os testes automatizados com Vitest garantem a qualidade e confiabilidade das funcionalidades implementadas.

#### Usuários
- **POST /createUser**
  - Cria um novo usuário.
  - Body: `{ "name": string, "email": string }`
  - Resposta: `{ "id": string, "name": string, "email": string }`

#### Autenticação
- **POST /auth/login**
  - Realiza login do usuário.
  - Body: `{ "email": string }`
  - Resposta: `{ "token": string }`

#### Refeições
- **POST /meals**
  - Registra uma nova refeição para o usuário autenticado.
  - Body: `{ "name": string, "description": string, "date": string, "hora": string, "isDiet": boolean }`
  - Resposta: `{ "id": string, "name": string, ... }`

- **GET /meals**
  - Lista todas as refeições do usuário autenticado.
  - Resposta: `[{ "id": string, "name": string, ... }]`

- **GET /meals/:id**
  - Detalha uma refeição específica.

- **PUT /meals/:id**
  - Atualiza uma refeição.

- **DELETE /meals/:id**
  - Remove uma refeição.

---

### Observações
- As migrations devem ser executadas antes de iniciar o servidor.
- O projeto pode ser adaptado para outros bancos de dados suportados pelo Knex.

---

