// Directions API は使わず、Google マップの経路 URL を開く（docs/tech-stack.md）
export function directionsUrl(spot: { lat: number; lng: number }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

// Worker も OGP の画像 URL に使うので shared に置いている
export { imageUrl } from "@shared/page-meta";
