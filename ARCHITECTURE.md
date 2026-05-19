# Arquitetura do Libris

O Libris é uma aplicação React para busca e organização local de livros usando a Google Books API. A solução foi estruturada com uma Clean Architecture adaptada ao frontend, separando rotas, componentes reutilizáveis, serviços de API, adapters, hooks e stores locais.

## Stack principal

- React + TypeScript strict + Vite.
- TanStack Router para rotas, incluindo rotas protegidas e rota dinâmica de detalhes.
- TanStack Query para server state, cache e controle de loading/error.
- Zustand com `persist` para autenticação simulada, estante e tema.
- React Hook Form + Zod para validação do login.
- TanStack Form + Zod para os filtros da busca.
- shadcn/ui + TailwindCSS para componentes e design system.
- TanStack Table para a listagem administrativa da estante.
- Vitest + React Testing Library para testes unitários e de componentes.
- jest-axe + axe-core para verificações básicas de acessibilidade.

## Organização de pastas

```txt
src/
  components/          Componentes reutilizáveis da aplicação
  components/ui/       Componentes base do shadcn/ui
  hooks/               Hooks utilitários compartilhados
  lib/                 Serviços, adapters, validações e utilitários
  routes/              Rotas file-based do TanStack Router
  stores/              Estados locais persistidos com Zustand
  test/                Configuração global de testes
```

A aplicação ainda está pequena, então a estrutura evita camadas desnecessárias. Mesmo assim, as regras principais ficam isoladas dos componentes visuais:

- `src/lib/google-books.ts`: serviço da Google Books API e adapter `mapVolume`.
- `src/lib/auth-validation.ts`: schema de validação do login.
- `src/lib/use-debounce.ts`: debounce da busca.
- `src/stores/auth.ts`: autenticação simulada e sessão persistida.
- `src/stores/shelf.ts`: estante, status de leitura e persistência local.
- `src/stores/theme.ts`: tema claro/escuro persistido.
- `src/test/setup.ts`: configuração global dos testes.

## Autenticação simulada

Como não há backend, o login é validado no cliente com Zod. Quando o formulário é submetido com e-mail válido e senha com mais de 6 caracteres, a aplicação gera um token fictício no formato `libris.<email-base64>.<timestamp>`.

Esse token e os dados mínimos do usuário são salvos no Zustand com middleware `persist`, usando a chave `libris.auth`. Por isso, a sessão continua ativa mesmo após refresh da página.

As rotas de busca, estante e detalhes ficam dentro de `_authenticated`. O `beforeLoad` verifica a existência do token e redireciona para `/login` quando necessário.

## Integração com Google Books API

A busca usa `GET https://www.googleapis.com/books/v1/volumes` com os parâmetros:

- `q`: termo pesquisado.
- `startIndex`: índice inicial da página.
- `maxResults`: tamanho da página.
- `printType`: `all`, `books` ou `magazines`.
- `orderBy`: `relevance` ou `newest`.

A API pode retornar dados incompletos ou aninhados. Para evitar espalhar esse tratamento pela UI, o adapter `mapVolume` normaliza o payload em uma interface `Book` limpa. Ele também aplica fallbacks para título, autor, categorias e capa.

A aplicação funciona sem chave de API. Caso seja necessário reduzir problemas de limite de requisições, é possível configurar `VITE_GOOGLE_BOOKS_API_KEY` no `.env`.

## Busca, filtros e URL

A busca utiliza TanStack Query para controlar requisições, cache, estados de loading e tratamento de erro. O campo de busca utiliza debounce para evitar chamadas excessivas à Google Books API.

Os filtros de tipo de impressão e ordenação foram implementados com TanStack Form e Zod. Essa escolha deixa a validação e o controle dos campos mais explícitos, além de atender ao requisito do desafio para os filtros da tela de descoberta.

O estado da busca é sincronizado com a URL para permitir refresh sem perda de contexto, compartilhamento de links e navegação previsível com voltar/avançar do navegador. Parâmetros com valores padrão são omitidos da URL para manter links mais limpos. Por exemplo:

```txt
/search?q=clarice
```

em vez de:

```txt
/search?q=clarice&page=1&printType=all&orderBy=relevance
```

## Estante virtual

A estante é mantida no store `useShelfStore`, com persistência local na chave `libris.shelf`. Cada livro salvo recebe:

- os dados normalizados do livro;
- `status`: `want`, `reading` ou `done`;
- `addedAt`: timestamp de inclusão.

A tela `/shelf` usa TanStack Table para exibir capa, título, autor, publicação, status e ações. A tabela permite ordenação por título e status, além da alteração direta do status do livro.

## UI/UX e acessibilidade

A interface foi pensada para ser responsiva, clara e acessível:

- estados vazios para busca, erros e estante vazia;
- skeletons durante carregamento;
- toasts para ações de adicionar, remover e atualizar status;
- fallback visual e acessível para livros sem thumbnail ou com imagem quebrada;
- labels em campos de formulário;
- skip link para acesso rápido ao conteúdo principal;
- foco visível para navegação por teclado;
- `role="alert"` para estados de erro;
- aviso em texto somente para leitores de tela quando links externos abrem em nova aba;
- tema claro/escuro persistido com Zustand.

## Testes

A aplicação possui testes automatizados com Vitest para validar regras essenciais do projeto:

- validação do formulário de login com Zod;
- transformação dos dados da Google Books API por meio do adapter/mapper;
- regras da estante, incluindo adicionar livros, alterar status, remover itens e evitar duplicidade;
- renderização de componentes reutilizáveis.

Também foram adicionados testes básicos de acessibilidade utilizando `jest-axe` e `axe-core`. Esses testes verificam componentes reutilizáveis da interface e ajudam a identificar violações estruturais comuns, complementando os cuidados aplicados no código.

Os testes podem ser executados com:

```bash
npm run test
```

## Decisões e trade-offs

- A busca mantém os filtros na URL para facilitar refresh, compartilhamento e navegação com histórico.
- A paginação usa botões e o parâmetro `startIndex`, evitando infinite scroll para manter o fluxo mais previsível.
- O total de páginas é limitado a 200 resultados, porque a Google Books API pode retornar `totalItems` muito alto e instável.
- A aplicação não depende de backend e não envia dados do usuário para nenhum serviço próprio.
- Os testes com `jest-axe` não substituem uma auditoria completa de acessibilidade no navegador, mas ajudam a prevenir problemas estruturais durante o desenvolvimento.
