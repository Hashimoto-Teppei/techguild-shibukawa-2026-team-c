import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_authed/maps/$mapId/")({ component: MapEditPage });

// マップ編集（#27 #15 で作る）
function MapEditPage() {
  const { mapId } = Route.useParams();
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-bold">マップ編集: {mapId}</h1>
      <Link to="/admin/maps/$mapId/qr" params={{ mapId }} className="underline">
        QR を発行
      </Link>
    </main>
  );
}
