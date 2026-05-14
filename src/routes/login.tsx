import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookMarked } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";
import { loginSchema, type LoginValues } from "@/lib/auth-validation";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: fallback(z.string(), "/search").default("/search"),
});

export const Route = createFileRoute("/login")({
  validateSearch: zodValidator(searchSchema),
  beforeLoad: () => {
    if (typeof window !== "undefined" && useAuthStore.getState().token) {
      throw redirect({ to: "/search" });
    }
  },
  head: () => ({
    meta: [
      { title: "Entrar — Libris" },
      { name: "description", content: "Acesse sua estante pessoal no Libris." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: to } = Route.useSearch();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    await new Promise((r) => setTimeout(r, 350)); // simula request
    login(values.email);
    toast.success("Bem-vinda de volta!");
    navigate({ to, replace: true });
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-primary">
          <BookMarked aria-hidden="true" className="size-6" />
          <span className="font-serif text-xl font-semibold text-foreground">Libris</span>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-foreground">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use qualquer e-mail. Esta autenticação é simulada — sem backend.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-err" : undefined}
              className="min-h-11"
              {...register("email")}
            />
            {errors.email && (
              <p id="email-err" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "pw-err" : "pw-hint"}
              className="min-h-11"
              {...register("password")}
            />
            {errors.password ? (
              <p id="pw-err" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : (
              <p id="pw-hint" className="text-xs text-muted-foreground">
                Mínimo de 7 caracteres.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full min-h-11" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </section>
  );
}
