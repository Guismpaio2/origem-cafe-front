# Origem Café — Front-end (Web)

Interface web do e-commerce da **Origem Café**, projeto final da disciplina ECOT11A — Laboratório de Engenharia de Software I (UNIFEI, Prof. Edvard).

- **Autor:** Guilherme Carneiro Sampaio — matrícula 2024003567
- **Back-end:** [`origem-cafe-api`](https://github.com/Guismpaio2/origem-cafe-api)
- **Branch de desenvolvimento:** `developer`

## Sobre o projeto

Loja online de cafés especiais por origem, com:

- catálogo com origem, notas de xícara e preço "a partir de", com filtro por tipo;
- página do café com escolha obrigatória de moagem e peso;
- carrinho sem login, salvo na API e unido à conta no login;
- finalização com entrega no endereço (CEP preenchido pelo ViaCEP) ou retirada com dia e horário livres;
- pagamento em ambiente de teste, com confirmação ou cancelamento do pedido;
- clube mensal de cafés, com pausar, retomar e cancelar;
- avaliações de quem recebeu o produto, com reenvio automático se a conexão cair;
- minha conta: nome, endereços e exclusão da conta com anonimização;
- painel da equipe: resumo, cadastro de produtos e status de pedidos.

## Tecnologias

React 19 · TypeScript · Vite 8 · React Router 8 · CSS Modules com tokens · oxlint

## Como executar localmente

Pré-requisitos: **Node.js 22 ou superior** e npm. A API precisa estar rodando (veja o README da `origem-cafe-api`).

```bash
# 1. Instale as dependências
npm install

# 2. Suba o front em modo de desenvolvimento (http://localhost:5173)
npm run dev
```

O front chama a API em `/api/v1`. Em desenvolvimento, o Vite encaminha essas chamadas para `http://localhost:3000`.

Para ver a versão de produção:

```bash
npm run build
npm run preview   # http://localhost:4173
```

## Comandos

| Comando           | O que faz                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento                      |
| `npm run build`   | Verifica tipos (tsc) e gera a versão de produção |
| `npm run lint`    | Análise estática com oxlint                      |
| `npm run preview` | Serve o build de produção                        |

## Contas de teste

Crie uma conta pela tela **Criar conta**, ou use as contas de teste do seed da API (veja o README da API).

## Qualidade verificada

- Build e lint sem erros.
- Teste de navegador (Chromium) dos fluxos de catálogo, carrinho, checkout, conta, assinatura e painel.
- Auditoria de acessibilidade com axe-core: sem violações WCAG 2.1 AA nas 12 telas auditadas.
- Contraste de todas as combinações de cor usadas: mínimo de 5,58:1 (WCAG AA exige 4,5:1).
- Sem rolagem horizontal em 360, 390, 768, 1024 e 1440 px.
- Carregamento do catálogo com 4G simulado: LCP de cerca de 1,45 s (meta: 2,5 s).

## Estrutura de pastas

```
src/
  app/            providers (autenticação, carrinho) e rotas
  features/       catálogo, carrinho, checkout, pedidos, conta, assinaturas, avaliações, admin
  shared/         cliente HTTP, tokens de estilo, hooks, componentes e formatação
public/           ícones
```

Diretrizes de desenvolvimento estão em [`AGENTS.md`](./AGENTS.md).
