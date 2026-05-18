import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, ExternalLink, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCover } from "@/components/BookCover";
import { EmptyState } from "@/components/EmptyState";
import { getBook } from "@/lib/google-books";
import { STATUS_LABEL, type ShelfStatus, useShelfStore } from "@/stores/shelf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/book/$bookId")({
  head: () => ({
    meta: [{ title: "Detalhes do livro — Libris" }],
  }),
  component: BookDetailsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <EmptyState role="alert" title="Não foi possível carregar" description={error.message} />
    </div>
  ),
});

function BookDetailsPage() {
  const { bookId } = Route.useParams();
  const router = useRouter();

  const shelfBook = useShelfStore((s) => s.books.find((b) => b.id === bookId));
  const add = useShelfStore((s) => s.add);
  const remove = useShelfStore((s) => s.remove);
  const setStatus = useShelfStore((s) => s.setStatus);
  const inShelf = Boolean(shelfBook);

  const {
    data: book,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["books", "detail", bookId],
    queryFn: () => getBook(bookId),
    staleTime: 5 * 60_000,
  });

  if (isPending) return <DetailsSkeleton />;

  if (isError || !book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EmptyState
          role="alert"
          title="Livro não encontrado"
          description={(error as Error)?.message}
        />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.history.back()}
        className="mb-6 min-h-11"
      >
        <ArrowLeft aria-hidden="true" /> Voltar
      </Button>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div>
          <BookCover src={book.thumbnail} title={book.title} />
          <div className="mt-4 space-y-2">
            {!inShelf ? (
              <Button
                className="w-full min-h-11"
                onClick={() => {
                  add(book);
                  toast.success("Adicionado à estante");
                }}
              >
                <BookmarkPlus aria-hidden="true" /> Adicionar à estante
              </Button>
            ) : (
              <>
                <div className="rounded-md border border-border bg-card p-3">
                  <label
                    htmlFor="status-select"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </label>
                  <Select
                    value={shelfBook!.status}
                    onValueChange={(v) => {
                      setStatus(book.id, v as ShelfStatus);
                      toast.success(`Status: ${STATUS_LABEL[v as ShelfStatus]}`);
                    }}
                  >
                    <SelectTrigger id="status-select" className="mt-1 min-h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want">Quero ler</SelectItem>
                      <SelectItem value="reading">Lendo</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="w-full min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    remove(book.id);
                    toast.success("Removido da estante");
                  }}
                >
                  <Trash2 aria-hidden="true" /> Remover da estante
                </Button>
              </>
            )}
            {book.previewLink && (
              <Button asChild variant="outline" className="w-full min-h-11">
                <a href={book.previewLink} target="_blank" rel="noreferrer noopener">
                  <ExternalLink aria-hidden="true" /> Preview no Google Books
                  <span className="sr-only"> abre em nova aba</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{book.authors.join(", ")}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">{book.title}</h1>
          {book.subtitle && <p className="mt-1 text-lg text-muted-foreground">{book.subtitle}</p>}

          {book.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {book.categories.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {book.publisher && <Field label="Editora" value={book.publisher} />}
            {book.publishedDate && <Field label="Publicação" value={book.publishedDate} />}
            {book.pageCount && <Field label="Páginas" value={String(book.pageCount)} />}
            {book.language && <Field label="Idioma" value={book.language.toUpperCase()} />}
            {book.averageRating && (
              <Field
                label="Avaliação"
                value={`${book.averageRating.toFixed(1)} ★ (${book.ratingsCount ?? 0})`}
              />
            )}
          </dl>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-foreground">Sinopse</h2>
            <div
              className="prose-sm mt-3 max-w-none text-sm leading-relaxed text-foreground/90"
              // descrições da Google Books são HTML simples (b, br, p)
              dangerouslySetInnerHTML={{
                __html: book.description ?? "<p>Sinopse não disponível.</p>",
              }}
            />
          </section>

          <p className="mt-8 text-xs text-muted-foreground">
            <Link to="/search" className="underline-offset-2 hover:underline">
              ← Buscar mais livros
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <Skeleton className="aspect-[2/3] w-full rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-6 h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
