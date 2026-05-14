import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Compass, Home, Library, SearchIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { applyTheme, useThemeStore } from "@/stores/theme";

function NotFoundComponent() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isAuthed = useAuthStore((s) => Boolean(s.token));

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      role="alert"
      aria-labelledby="nf-title"
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background px-4 py-16"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <Compass className="size-7" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Erro 404
        </p>
        <h1
          id="nf-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl"
        >
          Esta página não existe
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          O endereço que você tentou abrir não foi encontrado. Talvez o link esteja
          desatualizado, ou o livro tenha sido removido.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          {isAuthed ? (
            <>
              <Link
                to="/search"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <SearchIcon aria-hidden="true" className="size-4" />
                Voltar à busca
              </Link>
              <Link
                to="/shelf"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Library aria-hidden="true" className="size-4" />
                Ir para minha estante
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Home aria-hidden="true" className="size-4" />
              Voltar ao início
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light dark" },
      { title: "Libris — sua biblioteca pessoal" },
      {
        name: "description",
        content:
          "Libris é o gerenciador de biblioteca pessoal: descubra livros pela Google Books API, organize sua estante e acompanhe leituras.",
      },
      { property: "og:title", content: "Libris — sua biblioteca pessoal" },
      { property: "og:description", content: "Descubra, organize e acompanhe suas leituras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemeBoot() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeBoot />
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          Libris · Construído com Google Books API
        </footer>
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
