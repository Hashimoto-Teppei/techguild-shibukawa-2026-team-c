import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_authed/maps/$mapId/qr")({ component: QrPage });

// QR 発行・印刷（#13 で作る）
function QrPage() {
  const { mapId } = Route.useParams();
  return <main className="p-4">QR: {mapId}</main>;
}
