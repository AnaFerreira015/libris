# Fluxo Git sugerido

Este projeto veio de uma base já praticamente pronta. Para evitar um único commit gigante, a recomendação é reconstruir a entrega em commits semânticos e pequenos.

## 1. Apontar para um novo repositório

Se o projeto ainda estiver ligado ao repositório antigo, remova o remote atual:

```bash
git remote remove origin
```

Depois, adicione o novo repositório:

```bash
git remote add origin git@github.com:SEU_USUARIO/libris.git
```

Ou, usando HTTPS:

```bash
git remote add origin https://github.com/SEU_USUARIO/libris.git
```

Confira se ficou correto:

```bash
git remote -v
```

## 2. Criar branch de trabalho

```bash
git checkout -b feature/libris-impl
```

## 3. Commits pequenos sugeridos

### Commit 1 — remover dependências e metadados do scaffold anterior

```bash
git add package.json bunfig.toml vite.config.ts wrangler.jsonc .env.example .gitignore
git add -u
git commit -m "chore: remove previous scaffold setup"
```

### Commit 2 — organizar validação e configuração de testes

```bash
git add src/lib/auth-validation.ts src/test/setup.ts tsconfig.json package.json vite.config.ts
git commit -m "test: configure vitest setup"
```

### Commit 3 — adicionar testes de regras principais

```bash
git add src/lib/*.test.ts src/stores/*.test.ts src/routes/login.tsx
git commit -m "test: cover auth validation and shelf rules"
```

### Commit 4 — documentar arquitetura e execução

```bash
git add ARCHITECTURE.md INSTRUCTIONS.md GIT_WORKFLOW.md .env.example
git commit -m "docs: add architecture and setup instructions"
```

## 4. Enviar para o novo repositório

```bash
git push -u origin feature/libris-impl
```

Depois, abra um Pull Request para `main` no seu próprio repositório.
