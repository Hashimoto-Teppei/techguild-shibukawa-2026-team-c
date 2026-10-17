import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

// この下の画面はログイン必須。/admin/login はこのレイアウトの外に置く
export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/admin/login" });
  },
  component: Outlet,
});
