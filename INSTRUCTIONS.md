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

O projeto foi desenvolvido como uma aplicação frontend para gerenciamento de uma biblioteca pessoal, permitindo que o usuário pesquise livros na Google Books API, visualize detalhes e salve itens em uma estante virtual persistida localmente.

A primeira decisão foi estruturar a aplicação de forma modular, separando responsabilidades entre rotas, componentes reutilizáveis, serviços de API, adapters e stores. Essa organização facilita a manutenção do projeto e evita que regras de negócio fiquem acopladas diretamente aos componentes visuais. Para lidar com os dados da Google Books API, foi criado um adapter responsável por transformar a resposta externa, que possui dados aninhados e nem sempre consistentes, em uma estrutura mais limpa e segura para uso no frontend.

A autenticação foi implementada de forma simulada, já que o desafio não exige backend. A tela de login utiliza validação com Zod, exigindo e-mail válido e senha com mais de seis caracteres. Ao realizar o login, a aplicação gera um token fictício e o persiste localmente, permitindo manter a sessão mesmo após atualizar a página. As rotas principais da aplicação são protegidas, garantindo que apenas usuários autenticados possam acessar a busca, os detalhes dos livros e a estante.

Para a busca de livros, foi utilizado TanStack Query para controlar o estado assíncrono, cache e tratamento de erros das requisições. O input de busca possui debounce para evitar chamadas excessivas à API, e a paginação utiliza o parâmetro `startIndex`, conforme especificado pela Google Books API. Os filtros de tipo de impressão e ordenação foram implementados com TanStack Form e Zod, mantendo validação e controle dos campos de forma mais estruturada. Também optei por sincronizar o estado da busca com a URL, permitindo compartilhar links, recarregar a página sem perder os filtros e melhorar a navegação pelo histórico do navegador.

A estante virtual foi implementada com Zustand e persistência local, permitindo que os livros salvos continuem disponíveis após o refresh da página. Para exibição da estante, utilizei TanStack Table, pois a funcionalidade exige uma listagem mais rica, com colunas específicas, ações, alteração de status e ordenação por título ou status. Essa escolha deixa a tabela mais escalável caso novas colunas ou filtros sejam adicionados no futuro.

Na interface, utilizei TailwindCSS e componentes baseados em shadcn/ui para manter consistência visual, responsividade e produtividade no desenvolvimento. Também foram adicionados estados de loading, empty state e erro, além de cuidados com acessibilidade, como labels em formulários, foco visível, textos alternativos para capas, fallback para livros sem imagem e mensagens semânticas para estados de erro.

Por fim, foram adicionados testes com Vitest para validar regras de negócio importantes, como validação do login, transformação dos dados da API e comportamento da estante. Também foram incluídos testes básicos de acessibilidade com `jest-axe` e `axe-core` em componentes reutilizáveis, ajudando a identificar problemas estruturais de acessibilidade durante o desenvolvimento.

Em resumo, as principais decisões técnicas buscaram equilibrar aderência ao desafio, organização do código, boa experiência de uso, persistência local, tratamento de dados externos inconsistentes e facilidade de manutenção.
