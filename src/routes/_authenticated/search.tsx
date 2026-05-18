import { useMemo } from "react";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCover } from "@/components/BookCover";
import { EmptyState } from "@/components/EmptyState";
import { useDebounce } from "@/lib/use-debounce";
import { GoogleBooksApiError, searchBooks, type OrderBy, type PrintType } from "@/lib/google-books";
import { useShelfStore } from "@/stores/shelf";
import { toast } from "sonner";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 3;

const SEARCH_DEFAULTS = {
  q: "",
  page: 1,
  printType: "all",
  orderBy: "relevance",
} as const;

type SearchState = {
  q?: string;
  page?: number;
  printType?: PrintType;
  orderBy?: OrderBy;
};

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  page: fallback(z.number().int().min(1), SEARCH_DEFAULTS.page).default(SEARCH_DEFAULTS.page),
  printType: fallback(z.enum(["all", "books", "magazines"]), SEARCH_DEFAULTS.printType).default(
    SEARCH_DEFAULTS.printType,
  ),
  orderBy: fallback(z.enum(["relevance", "newest"]), SEARCH_DEFAULTS.orderBy).default(
    SEARCH_DEFAULTS.orderBy,
  ),
});

export const Route = createFileRoute("/_authenticated/search")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [stripSearchParams(SEARCH_DEFAULTS)],
  },
  head: () => ({
    meta: [
      { title: "Descobrir livros — Libris" },
      { name: "description", content: "Busque livros via Google Books e adicione à sua estante." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, page, printType, orderBy } = Route.useSearch();
  const navigate = Route.useNavigate();
  const debouncedQ = useDebounce(q, 800);

  const enabled = debouncedQ.trim().length >= MIN_SEARCH_LENGTH;
  const startIndex = (page - 1) * PAGE_SIZE;

  const { data, isFetching, isError, error, isPending } = useQuery({
    queryKey: ["books", "search", debouncedQ, page, printType, orderBy],
    queryFn: () =>
      searchBooks({
        query: debouncedQ,
        startIndex,
        maxResults: PAGE_SIZE,
        printType: printType as PrintType,
        orderBy: orderBy as OrderBy,
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, queryError) => {
      if (queryError instanceof GoogleBooksApiError && queryError.status === 429) return false;
      return failureCount < 1;
    },
  });

  const totalPages = useMemo(() => {
    if (!data) return 1;
    const cap = Math.min(data.totalItems, 200);
    return Math.max(1, Math.ceil(cap / PAGE_SIZE));
  }, [data]);

  const update = (patch: Partial<SearchState>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Descobrir</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesquise por título, autor ou tema. Os resultados vêm da Google Books API.
        </p>
      </header>

      <form
        role="search"
        aria-label="Buscar livros"
        onSubmit={(e) => e.preventDefault()}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_14rem]">
          <div className="grid grid-rows-[1rem_3rem] gap-2">
            <Label
              htmlFor="q"
              className="block text-xs font-medium leading-4 text-muted-foreground"
            >
              Buscar
            </Label>
            <div className="relative h-12">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="q"
                value={q}
                onChange={(e) => update({ q: e.target.value, page: 1 })}
                placeholder="Ex: Clarice Lispector, Dom Casmurro…"
                className="h-12 pl-9"
              />
            </div>
          </div>

          <div className="grid grid-rows-[1rem_3rem] gap-2">
            <Label
              htmlFor="printType"
              className="block text-xs font-medium leading-4 text-muted-foreground"
            >
              Tipo
            </Label>
            <Select
              value={printType}
              onValueChange={(v) => update({ printType: v as PrintType, page: 1 })}
            >
              <SelectTrigger id="printType" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="books">Livros</SelectItem>
                <SelectItem value="magazines">Revistas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-rows-[1rem_3rem] gap-2">
            <Label
              htmlFor="orderBy"
              className="block text-xs font-medium leading-4 text-muted-foreground"
            >
              Ordenar
            </Label>
            <Select
              value={orderBy}
              onValueChange={(v) => update({ orderBy: v as OrderBy, page: 1 })}
            >
              <SelectTrigger id="orderBy" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      <div aria-live="polite" aria-busy={isFetching} className="mt-6">
        {!enabled && (
          <EmptyState
            icon={<SearchIcon className="size-8" />}
            title="Digite algo para começar"
            description={`Digite pelo menos ${MIN_SEARCH_LENGTH} caracteres. A busca é feita automaticamente após uma breve pausa.`}
          />
        )}

        {enabled && (isPending || (isFetching && !data)) && <ResultsGridSkeleton />}

        {isError && (
          <EmptyState
            role="alert"
            title="Não foi possível buscar"
            description={(error as Error)?.message ?? "Tente novamente em instantes."}
          />
        )}

        {enabled && data && data.items.length === 0 && (
          <EmptyState
            role="alert"
            title="Nenhum resultado"
            description={`Não encontramos livros para "${debouncedQ}".`}
          />
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Página {page} de {totalPages}
                {isFetching && (
                  <Loader2 className="ml-2 inline size-3 animate-spin" aria-label="Atualizando" />
                )}
              </span>
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {data.items.map((book) => (
                <BookGridItem key={book.id} book={book} />
              ))}
            </ul>

            <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => update({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                className="min-h-11"
              >
                <ChevronLeft aria-hidden="true" /> Anterior
              </Button>
              <span className="px-3 text-sm text-muted-foreground" aria-current="page">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => update({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
                className="min-h-11"
              >
                Próxima <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          </>
        )}
      </div>
    </section>
  );
}

function ResultsGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </li>
      ))}
    </ul>
  );
}

function BookGridItem({ book }: { book: import("@/lib/google-books").Book }) {
  const inShelf = useShelfStore((s) => s.books.some((b) => b.id === book.id));
  const add = useShelfStore((s) => s.add);
  const remove = useShelfStore((s) => s.remove);

  return (
    <li className="group rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-card">
      <Link
        to="/book/$bookId"
        params={{ bookId: book.id }}
        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Ver detalhes de ${book.title}`}
      >
        <BookCover src={book.thumbnail} title={book.title} />
        <h3 className="mt-3 line-clamp-2 text-sm font-medium text-foreground">{book.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {book.authors.join(", ")}
        </p>
      </Link>
      <Button
        size="sm"
        variant={inShelf ? "secondary" : "outline"}
        className="mt-2 w-full min-h-9"
        aria-label={
          inShelf ? `Remover ${book.title} da estante` : `Adicionar ${book.title} à estante`
        }
        aria-pressed={inShelf}
        onClick={() => {
          if (inShelf) {
            remove(book.id);
            toast.success("Removido da estante");
          } else {
            add(book);
            toast.success("Adicionado à estante");
          }
        }}
      >
        {inShelf ? (
          <>
            <BookmarkCheck aria-hidden="true" /> Remover da estante
          </>
        ) : (
          <>
            <BookmarkPlus aria-hidden="true" /> Adicionar
          </>
        )}
      </Button>
    </li>
  );
}
