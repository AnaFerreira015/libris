import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Library, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookCover } from "@/components/BookCover";
import { EmptyState } from "@/components/EmptyState";
import { STATUS_LABEL, type ShelfBook, type ShelfStatus, useShelfStore } from "@/stores/shelf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/shelf")({
  head: () => ({
    meta: [
      { title: "Minha estante — Libris" },
      { name: "description", content: "Seus livros salvos com status de leitura." },
    ],
  }),
  component: ShelfPage,
});

const STATUS_VARIANT: Record<ShelfStatus, "default" | "secondary" | "outline"> = {
  want: "outline",
  reading: "default",
  done: "secondary",
};

function ShelfPage() {
  const books = useShelfStore((s) => s.books);
  const setStatus = useShelfStore((s) => s.setStatus);
  const remove = useShelfStore((s) => s.remove);

  const [sorting, setSorting] = useState<SortingState>([{ id: "title", desc: false }]);

  const columns = useMemo<ColumnDef<ShelfBook>[]>(
    () => [
      {
        id: "cover",
        header: "Capa",
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            to="/book/$bookId"
            params={{ bookId: row.original.id }}
            aria-label={`Ver ${row.original.title}`}
          >
            <BookCover
              src={row.original.thumbnail}
              title={row.original.title}
              className="h-20 w-14"
              aspect=""
            />
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Título",
        cell: ({ row }) => (
          <Link
            to="/book/$bookId"
            params={{ bookId: row.original.id }}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        id: "authors",
        header: "Autor",
        accessorFn: (b) => b.authors.join(", "),
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "publishedDate",
        header: "Publicação",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {getValue<string | undefined>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[status]} aria-hidden="true">
                {STATUS_LABEL[status]}
              </Badge>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(row.original.id, v as ShelfStatus);
                  toast.success(`Status atualizado para "${STATUS_LABEL[v as ShelfStatus]}"`);
                }}
              >
                <SelectTrigger
                  className="h-9 min-h-9 w-36"
                  aria-label={`Alterar status de ${row.original.title}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want">Quero ler</SelectItem>
                  <SelectItem value="reading">Lendo</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remover ${row.original.title} da estante`}
            className="min-h-11 min-w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              remove(row.original.id);
              toast.success("Livro removido da estante");
            }}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [remove, setStatus],
  );

  const table = useReactTable({
    data: books,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Minha estante</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length === 0
              ? "Nenhum livro salvo ainda."
              : `${books.length} ${books.length === 1 ? "livro salvo" : "livros salvos"}.`}
          </p>
        </div>
      </header>

      {books.length === 0 ? (
        <EmptyState
          icon={<Library className="size-10" />}
          title="Sua estante está vazia"
          description="Vá até Descobrir, encontre algo interessante e adicione aqui."
          action={
            <Button asChild className="mt-2 min-h-11">
              <Link to="/search">Descobrir livros</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <caption className="sr-only">
              Lista de livros da sua estante. Use os cabeçalhos para ordenar.
            </caption>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
                        }
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" && (
                              <ArrowUp aria-hidden="true" className="size-3.5" />
                            )}
                            {sorted === "desc" && (
                              <ArrowDown aria-hidden="true" className="size-3.5" />
                            )}
                            {!sorted && (
                              <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
