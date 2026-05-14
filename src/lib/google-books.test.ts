import { describe, expect, it } from "vitest";

import { mapVolume } from "./google-books";

describe("mapVolume", () => {
  it("maps Google Books payloads to a clean frontend model", () => {
    const book = mapVolume({
      id: "abc123",
      volumeInfo: {
        title: "  Clean Code  ",
        subtitle: "A Handbook",
        authors: ["Robert C. Martin"],
        publisher: "Prentice Hall",
        publishedDate: "2008",
        categories: ["Software Engineering"],
        imageLinks: { thumbnail: "http://example.com/cover.jpg" },
        previewLink: "https://books.google.com/preview",
      },
    });

    expect(book).toMatchObject({
      id: "abc123",
      title: "Clean Code",
      subtitle: "A Handbook",
      authors: ["Robert C. Martin"],
      publisher: "Prentice Hall",
      publishedDate: "2008",
      categories: ["Software Engineering"],
      thumbnail: "https://example.com/cover.jpg",
      previewLink: "https://books.google.com/preview",
    });
  });

  it("provides safe fallbacks for incomplete data", () => {
    const book = mapVolume({ id: "missing" });

    expect(book.title).toBe("Sem título");
    expect(book.authors).toEqual(["Autor desconhecido"]);
    expect(book.categories).toEqual([]);
    expect(book.thumbnail).toBeUndefined();
  });
});
