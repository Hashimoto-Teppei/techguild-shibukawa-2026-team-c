import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPinned } from "lucide-react";
import { api } from "@/lib/api";
import { imageUrl } from "@/lib/urls";

export const Route = createFileRoute("/")({ component: MapListPage });

// 公開マップ一覧
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
      <h1 className="mb-4 text-2xl font-bold">公開中のマップ</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data?.map((m) => (
          <li key={m.id}>
            <Link
              to="/m/$mapId"
              params={{ mapId: m.id }}
              className="block overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md"
            >
              {m.headerImageKey ? (
                <img src={imageUrl(m.headerImageKey)} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center bg-muted text-muted-foreground">
                  <MapPinned className="size-10" />
                </div>
              )}
              <p className="p-3 font-bold">{m.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
