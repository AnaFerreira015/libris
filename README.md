# 📚 Libris

Libris é uma aplicação frontend para gerenciamento de biblioteca pessoal. A aplicação permite que o usuário faça login de forma simulada, pesquise livros na Google Books API, visualize detalhes e salve livros em uma estante virtual persistida localmente.

O projeto foi desenvolvido como resolução de um desafio técnico para a vaga de Desenvolvedor React Pleno, com foco em arquitetura, organização de código, consumo de API externa, experiência de uso, acessibilidade e testes.

## ✨ Funcionalidades

- Autenticação simulada no frontend.
- Validação do login com Zod.
- Persistência da sessão no navegador.
- Rotas protegidas para usuários autenticados.
- Busca de livros na Google Books API.
- Debounce no campo de busca para reduzir chamadas à API.
- Paginação usando o parâmetro `startIndex` da Google Books API.
- Filtros por tipo de impressão e ordenação.
- Filtros implementados com TanStack Form e Zod.
- Sincronização dos filtros com a URL.
- Omissão de parâmetros padrão da URL para manter links mais limpos.
- Página de detalhes do livro com sinopse, editora e link de preview.
- Estante virtual persistida localmente com Zustand.
- Alteração de status do livro: `Quero Ler`, `Lendo` e `Concluído`.
- Tabela da estante com TanStack Table.
- Ordenação da estante por título e status.
- Tema claro/escuro persistido.
- Estados de loading, erro e vazio.
- Fallback para livros sem capa ou com imagem quebrada.
- Cuidados de acessibilidade, incluindo labels, foco visível, skip link e mensagens semânticas.
- Testes unitários e testes básicos de acessibilidade.

## 🧱 Stack utilizada

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- TanStack Form
- TanStack Table
- Zustand
- Zod
- TailwindCSS
- shadcn/ui
- Vitest
- React Testing Library
- jest-axe
- axe-core

## 🗂️ Estrutura do projeto

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

A estrutura foi organizada para manter separação clara de responsabilidades. A regra de negócio fica concentrada em `lib`, `stores` e hooks específicos, enquanto os componentes ficam responsáveis principalmente pela interface.

## 🧠 Decisões técnicas

### Arquitetura

A aplicação foi estruturada de forma modular, seguindo uma adaptação de Clean Architecture para frontend. A ideia foi evitar que regras de negócio, chamadas de API e tratamento de dados ficassem acoplados diretamente aos componentes visuais.

A Google Books API retorna dados aninhados e, em alguns casos, incompletos. Por isso, foi criado um adapter/mapper para transformar o payload externo em uma interface mais limpa e segura para a aplicação. Essa decisão facilita o tratamento de campos opcionais, capas ausentes, autores inexistentes e descrições incompletas sem espalhar essa lógica pela UI.

### Autenticação simulada

Como o desafio não exige backend, a autenticação foi implementada no frontend. O formulário de login valida e-mail e senha com Zod. Ao realizar o login, a aplicação gera um token fictício e persiste a sessão localmente.

As rotas principais ficam protegidas, garantindo que apenas usuários autenticados possam acessar a busca, os detalhes dos livros e a estante.

### Busca e filtros

A busca utiliza TanStack Query para controlar requisições, cache, loading e erros. O input de busca possui debounce para evitar chamadas excessivas à Google Books API.

Os filtros de tipo de impressão e ordenação foram implementados com TanStack Form e Zod. Além disso, o estado da busca é sincronizado com a URL, permitindo que o usuário compartilhe o link, atualize a página sem perder os filtros e utilize a navegação do navegador de forma previsível.

Os parâmetros padrão são omitidos da URL para manter links mais limpos. Por exemplo:

```txt
/search?q=clarice
```

em vez de:

```txt
/search?q=clarice&page=1&printType=all&orderBy=relevance
```

### Estante virtual

A estante foi implementada com Zustand e persistência local. Isso permite que os livros salvos continuem disponíveis mesmo após o refresh da página.

A listagem da estante utiliza TanStack Table, pois a funcionalidade exige uma tabela mais rica, com colunas, ações, ordenação e alteração de status. Essa escolha também facilita a evolução da tabela caso novos filtros ou colunas sejam adicionados no futuro.

### UI/UX e acessibilidade

A interface foi construída com TailwindCSS e componentes baseados em shadcn/ui. Foram adicionados estados de loading, erro e vazio para oferecer feedback claro ao usuário.

Também foram aplicados cuidados de acessibilidade, como:

- labels em campos de formulário;
- foco visível para navegação por teclado;
- skip link para ir direto ao conteúdo principal;
- textos alternativos em capas de livros;
- fallback acessível para livros sem imagem;
- `role="alert"` para estados de erro;
- aviso para links externos que abrem em nova aba.

## 🔐 Variáveis de ambiente

A aplicação funciona sem chave da Google Books API para testes simples. Porém, a API pode aplicar rate limit em alguns cenários.

Para configurar uma chave, crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Depois, preencha:

```env
VITE_GOOGLE_BOOKS_API_KEY=sua_chave_aqui
```

O arquivo `.env` não deve ser versionado no Git. Apenas o `.env.example` deve ser mantido no repositório.

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js 22.12 ou superior.
- npm.

### Instalação

```bash
npm install
```

### Desenvolvimento local

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## 🧪 Scripts disponíveis

```bash
npm run lint        # Executa ESLint
npm run typecheck   # Verifica tipos TypeScript
npm run test        # Executa os testes
npm run test:watch  # Executa os testes em modo watch
npm run coverage    # Executa os testes com cobertura
npm run build       # Gera build de produção e verifica tipos
npm run preview     # Pré-visualiza o build
npm run format      # Formata o projeto com Prettier
```

## ✅ Testes

O projeto possui testes para regras de negócio e componentes importantes da aplicação.

Exemplos de cenários cobertos:

- validação do formulário de login;
- transformação dos dados da Google Books API;
- regras da estante virtual;
- renderização de componentes reutilizáveis;
- verificações básicas de acessibilidade com `jest-axe` e `axe-core`.

Para executar:

```bash
npm run test
```

Para gerar cobertura:

```bash
npm run coverage
```

## ♿ Acessibilidade

Além dos cuidados aplicados na interface, o projeto utiliza testes básicos com `jest-axe` e `axe-core` para identificar violações estruturais de acessibilidade em componentes reutilizáveis.

Esses testes não substituem uma auditoria completa no navegador, mas ajudam a prevenir problemas comuns durante o desenvolvimento.

## 📖 Fluxo de uso

1. Acesse a tela de login.
2. Informe um e-mail válido.
3. Informe uma senha com mais de 6 caracteres.
4. Pesquise livros na tela de descoberta.
5. Use os filtros de tipo de impressão e ordenação, se desejar.
6. Adicione livros à estante.
7. Acesse os detalhes de um livro para ver sinopse, editora e preview.
8. Acesse a estante para alterar status, ordenar a tabela ou remover livros.

## 🧹 Antes de enviar o projeto

Antes de publicar ou enviar o repositório, confira se arquivos locais e artefatos gerados não foram versionados:

```bash
git status
```

Não devem ser enviados:

```txt
.env
node_modules/
dist/
.wrangler/
.tanstack/
```

O `package-lock.json` deve ser versionado, pois o projeto usa npm e é uma aplicação frontend. Isso ajuda a garantir instalações mais consistentes em outros ambientes.

## 📌 Entrega sugerida

Crie uma branch para a implementação:

```bash
git checkout -b feature/libris-impl
```

Depois de concluir, abra um Pull Request para a branch `main` do seu próprio repositório.

No corpo do PR, inclua uma breve descrição do que foi feito, por exemplo:

```md
## Resumo

- Implementa autenticação simulada com sessão persistida.
- Adiciona busca de livros com Google Books API, debounce, paginação e filtros.
- Implementa estante virtual persistida com alteração de status.
- Adiciona tela de detalhes do livro.
- Inclui tema claro/escuro, estados de loading/erro/vazio e melhorias de acessibilidade.
- Adiciona testes unitários e testes básicos de acessibilidade.

## Validação

- npm run lint
- npm run typecheck
- npm run test
- npm run build
```
