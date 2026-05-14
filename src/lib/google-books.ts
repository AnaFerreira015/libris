/**
 * Google Books API service + adapter.
 * Adapter pattern: normaliza payloads "sujos" da API em interfaces limpas
 * usadas pelo restante do app.
 */

export type PrintType = "all" | "books" | "magazines";
export type OrderBy = "relevance" | "newest";

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories: string[];
  thumbnail?: string;
  language?: string;
  previewLink?: string;
  infoLink?: string;
  averageRating?: number;
  ratingsCount?: number;
}

interface RawVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    language?: string;
    previewLink?: string;
    infoLink?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
}

export function mapVolume(raw: RawVolume): Book {
  const v = raw.volumeInfo ?? {};
  // upgrade http→https para evitar mixed content
  const rawThumb = v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail;
  const thumbnail = rawThumb ? rawThumb.replace(/^http:\/\//, "https://") : undefined;

  return {
    id: raw.id,
    title: v.title?.trim() || "Sem título",
    subtitle: v.subtitle?.trim() || undefined,
    authors: Array.isArray(v.authors) && v.authors.length > 0 ? v.authors : ["Autor desconhecido"],
    publisher: v.publisher,
    publishedDate: v.publishedDate,
    description: v.description,
    pageCount: v.pageCount,
    categories: v.categories ?? [],
    thumbnail,
    language: v.language,
    previewLink: v.previewLink,
    infoLink: v.infoLink,
    averageRating: v.averageRating,
    ratingsCount: v.ratingsCount,
  };
}

export interface SearchResult {
  items: Book[];
  totalItems: number;
}

const BASE = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string | undefined;

function appendApiKey(url: URL) {
  if (GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", GOOGLE_BOOKS_API_KEY);
  }
}

export interface SearchParams {
  query: string;
  startIndex?: number;
  maxResults?: number;
  printType?: PrintType;
  orderBy?: OrderBy;
}

export async function searchBooks({
  query,
  startIndex = 0,
  maxResults = 12,
  printType = "all",
  orderBy = "relevance",
}: SearchParams): Promise<SearchResult> {
  if (!query.trim()) return { items: [], totalItems: 0 };

  const url = new URL(BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("startIndex", String(startIndex));
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("printType", printType);
  url.searchParams.set("orderBy", orderBy);
  appendApiKey(url);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Falha na busca (${res.status})`);
  const data = (await res.json()) as { items?: RawVolume[]; totalItems?: number };

  return {
    items: (data.items ?? []).map(mapVolume),
    totalItems: data.totalItems ?? 0,
  };
}

export async function getBook(id: string): Promise<Book> {
  const url = new URL(`${BASE}/${encodeURIComponent(id)}`);
  appendApiKey(url);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Livro não encontrado (${res.status})`);
  const data = (await res.json()) as RawVolume;
  return mapVolume(data);
}
