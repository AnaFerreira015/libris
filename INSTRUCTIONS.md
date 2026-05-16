# Instruções para rodar o Libris

## Sobre o projeto

O Libris é um gerenciador de biblioteca pessoal. Com ele, o usuário pode fazer login de forma simulada, pesquisar livros na Google Books API, visualizar detalhes e salvar livros em uma estante virtual persistida no navegador.

## Pré-requisitos

- Node.js 20 ou superior.
- npm, pnpm, yarn ou bun.

Os exemplos abaixo usam npm, mas o projeto também pode ser instalado com outro gerenciador de pacotes.

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

## Desenvolvimento local

```bash
npm run dev
```

## Erro 429 / Too Many Requests

Se a busca retornar `Too Many Requests`, crie um arquivo `.env` a partir do `.env.example` e informe uma chave em `VITE_GOOGLE_BOOKS_API_KEY`. A aplicação também evita retries desnecessários em respostas 429, aumenta o debounce da busca e mantém cache por mais tempo para reduzir chamadas repetidas durante testes manuais.

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Scripts úteis

```bash
npm run lint        # Executa ESLint
npm run typecheck   # Verifica tipos TypeScript
npm run test        # Executa testes unitários
npm run coverage    # Executa testes com cobertura
npm run build       # Gera build de produção e verifica tipos
npm run preview     # Pré-visualiza o build
```

## Fluxo de uso

1. Acesse `/login`.
2. Informe qualquer e-mail válido.
3. Informe uma senha com mais de 6 caracteres.
4. Pesquise livros em `/search`.
5. Adicione livros à estante.
6. Acesse `/shelf` para alterar status, ordenar a tabela ou remover livros.
7. Abra `/book/$bookId` para ver detalhes, sinopse, editora e link de preview.

## Funcionalidades implementadas

- Login simulado com Zod.
- Sessão persistida no navegador.
- Rotas protegidas para busca, estante e detalhes.
- Busca na Google Books API com debounce.
- Paginação usando `startIndex`.
- Filtros por tipo de impressão e ordenação.
- Estante persistida com Zustand.
- Status de leitura: Quero Ler, Lendo e Concluído.
- Tabela com TanStack Table e ordenação.
- Rota dinâmica de detalhes.
- Tema claro/escuro persistido.
- Estados de loading, erro e vazio.
- Fallback para capas ausentes ou quebradas.
- Testes unitários para validação, adapter e estante.

## Entrega sugerida

Crie uma branch para a implementação:

```bash
git checkout -b feature/libris-impl
```

Depois de concluir, abra um Pull Request para a branch `main` do seu próprio repositório.
