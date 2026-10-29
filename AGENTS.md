# AGENTS.md — origem-cafe-front (front-end)

Instruções para qualquer agente de IA que trabalhe neste repositório. Leia antes de alterar código.

## 1. Contexto

- Projeto final da disciplina ECOT11A (UNIFEI). Loja online da **Origem Café**.
- O autor é o Guilherme Carneiro Sampaio (matrícula 2024003567). O autor é **iniciante em React**, mas conhece **Angular**. Por isso, sempre que introduzir um conceito de React, explique-o comparando com Angular (ver seção 8) e faça mudanças em passos pequenos.
- Repositório irmão da API: `../origem-cafe-api`. Os contratos de endpoint são definidos lá.
- Fonte de verdade dos requisitos: documento de requisitos do projeto (Entrega 1), mantido fora deste repositório.

## 2. Stack (não trocar sem alinhar com o autor)

| Item            | Escolha                                   |
| --------------- | ----------------------------------------- |
| Biblioteca UI   | React 19                                  |
| Linguagem       | TypeScript em modo `strict`               |
| Build/dev       | Vite 8                                    |
| Roteamento      | React Router (a instalar no passo guiado) |
| Estado global   | Context API + `useReducer` (sem Redux no MVP) |
| Requisições     | `fetch` nativo encapsulado em `shared/api` |
| Estilo          | CSS Modules + variáveis CSS (tokens)      |
| Lint            | oxlint (`npm run lint`)                   |

Diretrizes visuais (incluindo o padrão "scroll flow") ainda **não** foram definidas. Não invente um sistema de design; quando o autor instalar as skills de design, siga-as.

## 3. Comandos

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento em http://localhost:5173
npm run build      # tsc -b + vite build (deve passar sem erros antes de entregar)
npm run lint       # oxlint
npm run preview    # serve o build de produção
```

Antes de dizer que algo está pronto, rode `npm run build` e `npm run lint` e informe o resultado.

## 4. Estrutura de pastas (alvo)

```
src/
  main.tsx                 ponto de entrada (monta o React na div#root)
  app/
    App.tsx                composição de providers + rotas
    providers/             AuthProvider, CartProvider
    routes/                definição das rotas e guardas (RequireAuth, RequireAdmin)
  features/
    catalogo/              listagem, detalhe do produto, seleção de moagem/peso
    carrinho/              reducer, contexto e página do carrinho
    checkout/              entrega x retirada, calendário de agendamento, pagamento
    auth/                  login, cadastro (consentimento LGPD), perfil, exclusão de conta
    assinaturas/           planos e gestão da assinatura
    avaliacoes/            formulário de avaliação (somente para compradores)
    admin/                 painel: dashboard, produtos, pedidos
  shared/
    api/                   cliente HTTP (base URL, token, tratamento de erros)
    components/            botões, campos, alertas, layout
    hooks/                 hooks reutilizáveis (useDebounce, useLocalStorage...)
    styles/                tokens (cores, espaçamentos, tipografia)
```

Regras:
- Código dentro de uma feature não importa de outra feature. O que for compartilhado vai para `shared/`.
- Um componente por arquivo. Nome do arquivo igual ao do componente (`ProductCard.tsx`).
- Hooks começam com `use` e ficam ao lado do módulo que os usa, ou em `shared/hooks` se forem genéricos.

## 5. Requisitos que afetam o front-end

Os IDs abaixo estão no documento do lab05. Cite o ID ao implementar.

- **RU001 / RF003** — catálogo com foto, preço, origem, notas sensoriais, moagem e tamanho.
- **RN002** — um café só entra no carrinho depois de escolher moagem **e** tamanho. Bloqueie o botão enquanto faltar algum deles.
- **RU002 / RF004** — navegar e adicionar ao carrinho **sem login**. Nada de tela de login na página inicial.
- **RNF003** — o carrinho e o rascunho do checkout ficam salvos por 24 h, inclusive após queda de conexão (persistência local com validade).
- **RN003** — retirada: seg a sáb, 08h às 18h, com 2 h de antecedência mínima. Mostre apenas horários válidos.
- **RN006** — frete e a regra de frete grátis vêm da API; não calcule frete no front.
- **RN001 / RF002** — o formulário de avaliação só aparece para pedidos "Entregue" ou "Retirado". Mesmo assim, a API valida; o front é apenas UX.
- **RNF004** — contraste mínimo 4,5:1 (WCAG 2.1 AA) e erros de formulário visíveis e descritos.
- **RNF005** — formulários navegáveis por Tab, com rótulos e atributos ARIA.
- **RNF008** — layout utilizável de 360 px até 1440 px, sem rolagem horizontal.
- **RNF010** — avaliação que falhar por rede fica guardada localmente e é reenviada ao reconectar.
- **RE001 (LGPD)** — o cadastro mostra o consentimento de tratamento de dados antes de criar a conta, e o perfil oferece exclusão da conta.
- **RE003 (CDC)** — compra online deve informar o direito de arrependimento de 7 dias.

## 6. Convenções de código

- Identificadores (variáveis, funções, arquivos, tipos): **inglês**. Textos exibidos ao usuário e mensagens de erro: **português do Brasil**.
- Use `type` para props e tipos de dados; `interface` só quando precisar de declaração estendida.
- Nunca use `any`. Se o tipo for desconhecido, use `unknown` e estreite com validação.
- Requisições à API sempre passam por `shared/api`. Não chame `fetch` direto dentro de componente.
- Preço e valores monetários chegam da API em **centavos** (inteiro). Formate apenas na camada de apresentação (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).
- Não coloque segredos no front. Tokens de pagamento ficam na API. Variáveis de ambiente do Vite começam com `VITE_`, e tudo o que começa com `VITE_` vai para o navegador.
- Evite `useEffect` para derivar dados que podem ser calculados durante a renderização.

## 7. Git

- Não faça commit nem push sem o autor pedir.
- Mensagens de commit em **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), com descrição em português.
- Cada mudança pequena e coerente vira um commit.

## 8. Guia rápido: Angular → React

Use esta tabela ao explicar conceitos novos ao autor.

| Conceito no Angular                  | Equivalente no React                                  |
| ------------------------------------ | ----------------------------------------------------- |
| Component (`@Component`, template)   | Função que retorna JSX (`function ProductCard() {}`)  |
| `@Input()`                           | `props` (objeto passado ao componente)                |
| `@Output()` + `EventEmitter`         | Função passada como prop (`onAddToCart`)              |
| Template com `*ngIf`                 | Expressão JS dentro do JSX (`{isLogged && <Ui/>}`)    |
| `*ngFor`                             | `array.map(item => <Item key={item.id} />)`           |
| `[(ngModel)]`                        | `value` + `onChange` (componente controlado)          |
| Service com `@Injectable`            | Hook customizado (`useCart`) + Context                |
| Injeção de dependência (`providedIn`) | `createContext` + `Provider` + `useContext`          |
| `ngOnInit` / `ngOnDestroy`           | `useEffect` (com função de limpeza)                   |
| RxJS `Observable`                    | Promise/`async-await` (no MVP não usamos RxJS)        |
| `NgModule`                           | Não existe: imports ES comuns                         |
| Angular Router + `canActivate`       | React Router + componente guarda (`RequireAdmin`)     |
| Pipes (`\| currency`)                | Função de formatação chamada no JSX                   |
| Change detection                     | Renderização por estado: o componente re-renderiza quando `useState`/`useReducer` muda |

## 9. Estado atual

- Projeto criado com Vite (template `react-ts`) e build validado.
- Ainda é o template padrão do Vite (`App.tsx` de demonstração). Substituir por essa estrutura é o próximo passo guiado.
- Próximas etapas: instalar React Router, criar a estrutura de pastas, montar o layout com tokens, depois o catálogo consumindo `GET /api/v1/products`.
