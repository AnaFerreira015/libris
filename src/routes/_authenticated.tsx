import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // No SSR/prerender, window é undefined: deixa passar — o ThemeBoot/cliente
    // re-validará e o componente abaixo redireciona se necessário.
    if (typeof window === "undefined") return;
    if (!useAuthStore.getState().token) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const token = useAuthStore((s) => s.token);
  // fallback client-side guard (caso estado venha hidratado depois do SSR)
  if (typeof window !== "undefined" && !token) {
    throw redirect({ to: "/login" });
  }
  return <Outlet />;
}
