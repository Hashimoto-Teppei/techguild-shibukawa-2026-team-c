import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({ component: MapListPage });

// 公開マップ一覧（#10 でつなぎ込み、#30 で見た目）
function MapListPage() {
  const { data } = useQuery({
    queryKey: ["maps"],
    queryFn: async () => {
      const res = await api.maps.$get();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold">公開中のマップ</h1>
      <ul className="space-y-2">
        {data?.map((m) => (
          <li key={m.id}>
            <Link to="/m/$mapId" params={{ mapId: m.id }} className="underline">
              {m.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
