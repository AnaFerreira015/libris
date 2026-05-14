import { Link, useNavigate } from "@tanstack/react-router";
import { BookMarked, LogOut, Moon, Search, Sun, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { toast } from "sonner";

export function Header() {
  const { user, logout, token } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-foreground"
          aria-label="Libris — página inicial"
        >
          <BookMarked aria-hidden="true" className="size-5 text-primary" />
          Libris
        </Link>

        {token && (
          <nav aria-label="Principal" className="ml-2 hidden items-center gap-1 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/search" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                <Search aria-hidden="true" /> Descobrir
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/shelf" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                <Library aria-hidden="true" /> Minha estante
              </Link>
            </Button>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            aria-pressed={theme === "dark"}
            className="min-h-11 min-w-11"
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>

          {token ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline" aria-live="polite">
                Olá, <span className="font-medium text-foreground">{user?.name}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  toast.success("Sessão encerrada");
                  navigate({ to: "/login" });
                }}
                className="min-h-11"
              >
                <LogOut aria-hidden="true" /> Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="min-h-11">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>

      {token && (
        <nav aria-label="Principal mobile" className="flex gap-1 border-t border-border px-4 py-2 sm:hidden">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link to="/search">
              <Search aria-hidden="true" /> Descobrir
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link to="/shelf">
              <Library aria-hidden="true" /> Estante
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
