import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/_authed/")({ component: AdminMapListPage });

// 自分のマップ一覧（#27 で新規作成などを足す）
function AdminMapListPage() {
  const { data } = useQuery({
    queryKey: ["admin", "maps"],
    queryFn: async () => {
      const res = await api.admin.maps.$get();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold">自分のマップ</h1>
      <ul className="space-y-2">
        {data?.map((m) => (
          <li key={m.id}>
            <Link to="/admin/maps/$mapId" params={{ mapId: m.id }} className="underline">
              {m.title}
            </Link>
            {!m.published && <span className="ml-2 text-sm text-neutral-500">非公開</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
