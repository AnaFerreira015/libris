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

interface ApiErrorPayload {
  error?: {
    message?: string;
    status?: string;
  };
}

export class GoogleBooksApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfter?: string | null,
  ) {
    super(message);
    this.name = "GoogleBooksApiError";
  }
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
const SEARCH_FIELDS = [
  "totalItems",
  "items(id,volumeInfo(title,subtitle,authors,publisher,publishedDate,categories,imageLinks,language,previewLink,infoLink))",
].join(",");

function appendApiKey(url: URL) {
  if (GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", GOOGLE_BOOKS_API_KEY);
  }
}

async function readGoogleBooksError(res: Response): Promise<GoogleBooksApiError> {
  let apiMessage: string | undefined;

  try {
    const data = (await res.json()) as ApiErrorPayload;
    apiMessage = data.error?.message;
  } catch {
    apiMessage = undefined;
  }

  if (res.status === 429) {
    return new GoogleBooksApiError(
      "A Google Books API limitou temporariamente as buscas. Aguarde alguns instantes e tente novamente. Para testes mais estáveis, configure VITE_GOOGLE_BOOKS_API_KEY no arquivo .env.",
      res.status,
      res.headers.get("Retry-After"),
    );
  }

  return new GoogleBooksApiError(
    apiMessage ?? `Falha na comunicação com a Google Books API (${res.status})`,
    res.status,
    res.headers.get("Retry-After"),
  );
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
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return { items: [], totalItems: 0 };

  const url = new URL(BASE);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("startIndex", String(startIndex));
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("printType", printType);
  url.searchParams.set("orderBy", orderBy);
  url.searchParams.set("fields", SEARCH_FIELDS);
  appendApiKey(url);

  const res = await fetch(url.toString());
  if (!res.ok) throw await readGoogleBooksError(res);
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
  if (!res.ok) throw await readGoogleBooksError(res);
  const data = (await res.json()) as RawVolume;
  return mapVolume(data);
}
