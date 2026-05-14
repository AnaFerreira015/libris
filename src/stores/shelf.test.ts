import { beforeEach, describe, expect, it } from "vitest";

import type { Book } from "@/lib/google-books";
import { useShelfStore } from "./shelf";

const book: Book = {
  id: "book-1",
  title: "Dom Casmurro",
  authors: ["Machado de Assis"],
  categories: ["Fiction"],
};

describe("useShelfStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useShelfStore.setState({ books: [] });
  });

  it("adds a book with the default status", () => {
    useShelfStore.getState().add(book);

    expect(useShelfStore.getState().books).toHaveLength(1);
    expect(useShelfStore.getState().books[0]).toMatchObject({
      id: "book-1",
      status: "want",
    });
  });

  it("updates status and removes a book", () => {
    useShelfStore.getState().add(book);
    useShelfStore.getState().setStatus("book-1", "reading");

    expect(useShelfStore.getState().books[0]?.status).toBe("reading");

    useShelfStore.getState().remove("book-1");
    expect(useShelfStore.getState().books).toEqual([]);
  });

  it("does not duplicate the same book", () => {
    useShelfStore.getState().add(book);
    useShelfStore.getState().add(book);

    expect(useShelfStore.getState().books).toHaveLength(1);
  });
});
