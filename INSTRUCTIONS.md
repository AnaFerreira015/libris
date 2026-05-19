# Instruções para rodar o Libris

## Sobre o projeto

O Libris é um gerenciador de biblioteca pessoal. Com ele, o usuário pode fazer login de forma simulada, pesquisar livros na Google Books API, visualizar detalhes e salvar livros em uma estante virtual persistida no navegador.

## Pré-requisitos

- Node.js 22.12 ou superior.
- npm.

> O projeto utiliza `package-lock.json`, portanto os comandos abaixo consideram npm como gerenciador de pacotes.

## Instalação

```bash
npm install
```

## Variáveis de ambiente

A aplicação funciona sem chave da Google Books API para testes simples.

Se quiser configurar uma chave para reduzir risco de rate limit, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

E preencha:

```env
VITE_GOOGLE_BOOKS_API_KEY=sua_chave_aqui
```

O arquivo `.env` não deve ser versionado no Git.

## Desenvolvimento local

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Erro 429 / Too Many Requests

Se a busca retornar `Too Many Requests`, crie um arquivo `.env` a partir do `.env.example` e informe uma chave em `VITE_GOOGLE_BOOKS_API_KEY`.

A aplicação também reduz chamadas repetidas à API usando debounce no campo de busca, cache no TanStack Query e evitando retries desnecessários em respostas 429.

## Scripts úteis

```bash
npm run lint        # Executa ESLint
npm run typecheck   # Verifica tipos TypeScript
npm run test        # Executa testes automatizados
npm run test:watch  # Executa os testes em modo watch
npm run coverage    # Executa testes com cobertura
npm run build       # Gera build de produção e verifica tipos
npm run preview     # Pré-visualiza o build
npm run format      # Formata o projeto com Prettier
```

## Validação antes da entrega

Antes de enviar o projeto, recomenda-se executar:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Fluxo de uso

1. Acesse `/login`.
2. Informe qualquer e-mail válido.
3. Informe uma senha com mais de 6 caracteres.
4. Pesquise livros em `/search`.
5. Use os filtros de tipo de impressão e ordenação, se desejar.
6. Adicione livros à estante.
7. Acesse `/shelf` para alterar status, ordenar a tabela ou remover livros.
8. Abra `/book/$bookId` para ver detalhes, sinopse, editora e link de preview.

## Funcionalidades implementadas

- Login simulado com Zod.
- Sessão persistida no navegador.
- Rotas protegidas para busca, estante e detalhes.
- Busca na Google Books API com debounce.
- Paginação usando `startIndex`.
- Filtros por tipo de impressão e ordenação com TanStack Form e Zod.
- Sincronização dos filtros com a URL.
- Estante persistida com Zustand.
- Status de leitura: Quero Ler, Lendo e Concluído.
- Tabela com TanStack Table e ordenação.
- Rota dinâmica de detalhes.
- Tema claro/escuro persistido.
- Estados de loading, erro e vazio.
- Fallback para capas ausentes ou quebradas.
- Cuidados de acessibilidade, como labels, foco visível, skip link e mensagens semânticas.
- Testes automatizados, adapter e estante.
- Testes básicos de acessibilidade com `jest-axe` e `axe-core`.

## Cuidados antes de publicar

Antes de publicar ou enviar o repositório, verifique se arquivos locais e artefatos gerados não foram versionados:

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

O `package-lock.json` deve ser versionado, pois o projeto usa npm e é uma aplicação frontend.
