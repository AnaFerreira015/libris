import { createFileRoute, Link } from "@tanstack/react-router";
import { Library, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const token = useAuthStore((s) => s.token);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
          Sua biblioteca pessoal, organizada
        </p>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Descubra, organize e acompanhe suas leituras
        </h1>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Pesquise milhões de livros via Google Books, monte sua estante e marque o status de cada
          leitura — tudo persistido no seu navegador.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {token ? (
            <>
              <Button asChild size="lg" className="min-h-11">
                <Link to="/search">
                  <Search aria-hidden="true" /> Começar a explorar
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11">
                <Link to="/shelf">
                  <Library aria-hidden="true" /> Ver minha estante
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="min-h-11">
              <Link to="/login">Entrar para começar</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: Search,
            title: "Busca inteligente",
            desc: "Resultados em tempo real com debounce, filtros e paginação.",
          },
          {
            icon: Library,
            title: "Estante persistente",
            desc: "Adicione livros e acompanhe Quero ler · Lendo · Concluído.",
          },
          {
            icon: Sparkles,
            title: "Leve e acessível",
            desc: "Tema claro/escuro, navegação por teclado e contraste AAA.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Icon aria-hidden="true" className="size-5 text-primary" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-card-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
