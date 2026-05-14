import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  title: string;
  className?: string;
  /** width-ratio class names — default `aspect-[2/3]` */
  aspect?: string;
}

/**
 * Capa do livro com fallback gráfico acessível quando não há thumbnail
 * ou a imagem falha ao carregar.
 */
export function BookCover({ src, title, className, aspect = "aspect-[2/3]" }: Props) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted ring-1 ring-border",
        aspect,
        className,
      )}
    >
      {showFallback ? (
        <div
          role="img"
          aria-label={`Capa indisponível para ${title}`}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-secondary p-3 text-muted-foreground"
        >
          <BookOpen aria-hidden="true" className="size-8 opacity-70" />
          <span className="line-clamp-3 text-center text-xs font-medium">{title}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Capa do livro ${title}`}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
