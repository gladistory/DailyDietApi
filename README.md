# DailyDietApi

## Visão Geral

A DailyDietApi é uma API RESTful desenvolvida em Node.js com TypeScript, utilizando o Knex.js para gerenciamento de banco de dados. O objetivo é permitir o registro, acompanhamento e análise de refeições dos usuários, promovendo hábitos alimentares saudáveis.

---

## Funcionalidades Implementadas

- **Criação de Usuário:**  
  Permite o cadastro de novos usuários na plataforma.

- **Identificação de Usuário:**  
  Utiliza autenticação baseada em sessão para identificar o usuário entre as requisições.

- **Registro de Refeições:**  
  Usuários podem registrar refeições com os seguintes dados:
  - Nome
  - Descrição
  - Data e Hora
  - Status (dentro ou fora da dieta)
  - Associação da refeição ao usuário

---

## Funcionalidades

- **Edição de Refeição:**  
  Permitir que o usuário edite todos os dados de uma refeição já registrada.

- **Exclusão de Refeição:**  
  Permitir que o usuário apague refeições cadastradas.

- **Listagem de Refeições:**  
  Listar todas as refeições de um usuário autenticado.

- **Visualização de Refeição:**  
  Permitir visualizar os detalhes de uma única refeição.

- **Métricas do Usuário:**  
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta

- **Restrições de Acesso:**  
  Garantir que o usuário só possa visualizar, editar e apagar refeições que ele mesmo criou.

---

## Estrutura do Projeto

- `src/`
  - `app.ts` / `server.ts`: Inicialização do servidor e configuração principal.
  - `db/`: Configuração do banco de dados e migrations.
  - `env/`: Configurações de ambiente.
  - `middleware/`: Middlewares de autenticação e validação de sessão.
  - `routes/`: Rotas organizadas por contexto (ex: criação de usuário, registro de refeições).
  - `@types/`: Tipagens customizadas para o projeto.

---

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Knex.js (migrations e queries)
- Fastify
- MySQL (ou outro banco relacional, conforme configuração)
- Testes automatizados (Vitest)

---

## Pontos Fortes

- Estrutura modular e organizada por contexto.
- Uso de TypeScript para maior segurança e produtividade.
- Migrations versionadas para controle do banco de dados.
- Middleware para autenticação e controle de sessão.

---

## Como Executar o Projeto

1. Instale as dependências:
   ```
   npm install
   ```

2. Execute as migrations:
   ```
   npm run knex migrate:latest
   ```

3. Inicie o servidor:
   ```
   npm run dev
   ```
