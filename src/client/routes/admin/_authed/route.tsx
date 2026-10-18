import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// この下の画面はログイン必須。/admin/login はこのレイアウトの外に置く
export const Route = createFileRoute("/admin/_authed")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

// 作成者の画面に共通のヘッダー。どの画面からもトップと自分のマップに戻れるようにする
function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  async function onSignOut() {
    setError("");
    const { error } = await authClient.signOut();
    // 失敗したまま画面だけ移ると、共用 PC で次の人にマップが見えてしまう
    if (error) return setError("ログアウトできんかったけぇ、もういっぺん押してぇ");
    // 先に画面を離れる。表示中の画面があるうちに消すと、ログアウト後に読み込み直して失敗表示が出る
    await navigate({ to: "/admin/login" });
    queryClient.clear();
  }

  return (
    <>
      <header className="border-b print:hidden">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-heading text-lg">
            たまりんマップ
          </Link>
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className="text-sm data-[status=active]:font-bold"
          >
            自分のマップ
          </Link>
          {error && (
            <p className="ml-auto text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button variant="ghost" size="sm" className={error ? "" : "ml-auto"} onClick={onSignOut}>
            ログアウト
          </Button>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
