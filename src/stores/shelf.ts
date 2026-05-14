import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book } from "@/lib/google-books";

export type ShelfStatus = "want" | "reading" | "done";

export const STATUS_LABEL: Record<ShelfStatus, string> = {
  want: "Quero ler",
  reading: "Lendo",
  done: "Concluído",
};

export interface ShelfBook extends Book {
  status: ShelfStatus;
  addedAt: number;
}

interface ShelfState {
  books: ShelfBook[];
  add: (book: Book, status?: ShelfStatus) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: ShelfStatus) => void;
  has: (id: string) => boolean;
  get: (id: string) => ShelfBook | undefined;
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      books: [],
      add: (book, status = "want") =>
        set((s) =>
          s.books.some((b) => b.id === book.id)
            ? s
            : { books: [{ ...book, status, addedAt: Date.now() }, ...s.books] },
        ),
      remove: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          books: s.books.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
      has: (id) => get().books.some((b) => b.id === id),
      get: (id) => get().books.find((b) => b.id === id),
    }),
    { name: "libris.shelf" },
  ),
);
