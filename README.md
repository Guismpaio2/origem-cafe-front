# Origem Café — Front-end (Web)

Interface web do e-commerce da **Origem Café**, desenvolvido como projeto final da disciplina ECOT11A — Laboratório de Engenharia de Software I (UNIFEI, Prof. Edvard).

- **Autor:** Guilherme Carneiro Sampaio — matrícula 2024003567
- **Repositório da API:** `origem-cafe-api` (back-end em Node.js + MongoDB)

## Sobre o projeto

Loja online de cafés especiais, grãos selecionados e acessórios para preparo, com:

- catálogo com origem, notas sensoriais e escolha de moagem e tamanho;
- carrinho de compras acessível sem login;
- checkout com entrega no endereço ou retirada agendada na loja física;
- clube de assinatura mensal de cafés;
- avaliações restritas a clientes que compraram o produto;
- painel administrativo para pedidos, catálogo e indicadores.

## Tecnologias

React 19 · TypeScript · Vite · React Router · oxlint

## Como executar localmente

Pré-requisitos: **Node.js 22 ou superior** (LTS) e **npm**.

```bash
# 1. Instale as dependências
npm install

# 2. Suba o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`.

Outros comandos:

| Comando           | O que faz                                   |
| ----------------- | ------------------------------------------- |
| `npm run build`   | Verifica tipos e gera a versão de produção  |
| `npm run preview` | Sobe a versão gerada em `dist/`             |
| `npm run lint`    | Analisa o código com o oxlint               |

A URL da API será definida no arquivo `.env.local` (variável `VITE_API_URL`, ver `.env.example` quando for criado). A API precisa estar rodando para as telas que consomem dados.

## Estrutura de pastas

```
src/
  app/        providers globais e rotas
  features/   um módulo por domínio (catalogo, carrinho, checkout, auth, assinaturas, avaliacoes, admin)
  shared/     componentes, hooks, cliente HTTP e tokens visuais reutilizados
```

Diretrizes detalhadas para desenvolvimento estão em [`AGENTS.md`](./AGENTS.md).
