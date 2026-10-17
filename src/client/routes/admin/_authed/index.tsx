import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/_authed/")({ component: AdminMapListPage });

// 自分のマップ一覧・新規作成
function AdminMapListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const { data } = useQuery({
    queryKey: ["admin", "maps"],
    queryFn: async () => {
      const res = await api.admin.maps.$get();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = String(new FormData(e.currentTarget).get("title"));
    const res = await api.admin.maps.$post({ json: { title } });
    if (!res.ok) return setError("作成できませんでした");
    const { id } = await res.json();
    queryClient.invalidateQueries({ queryKey: ["admin", "maps"] });
    navigate({ to: "/admin/maps/$mapId", params: { mapId: id } });
  }

  async function onSignOut() {
    await authClient.signOut();
    queryClient.clear();
    navigate({ to: "/admin/login" });
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">自分のマップ</h1>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          ログアウト
        </Button>
      </div>
      <ul className="divide-y rounded-xl border">
        {data?.map((m) => (
          <li key={m.id}>
            <Link
              to="/admin/maps/$mapId"
              params={{ mapId: m.id }}
              className="flex items-center gap-2 p-4 hover:bg-muted"
            >
              <span className="flex-1 font-medium">{m.title}</span>
              <Badge variant={m.published ? "default" : "secondary"}>
                {m.published ? "公開中" : "非公開"}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
      <form onSubmit={onCreate} className="flex gap-2">
        <Input
          name="title"
          placeholder="新しいマップの名前"
          required
          aria-label="新しいマップの名前"
        />
        <Button type="submit">作成</Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">
        作ったマップは非公開です。編集画面で公開できます
      </p>
    </main>
  );
}
