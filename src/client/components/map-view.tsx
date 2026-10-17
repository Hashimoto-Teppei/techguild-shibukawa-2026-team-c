import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type LatLng = { lat: number; lng: number };
type MapSpot = LatLng & { id: string; name: string };

type Props = {
  spots: MapSpot[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  // 管理画面用: 地図クリックでピンを置き、ドラッグで動かす
  onMapClick?: (pos: LatLng) => void;
  onSpotDrag?: (id: string, pos: LatLng) => void;
};

// スポットがないときの中心（仮の値。#32 のデータに合わせて直す）
const SHIBUKAWA = { lat: 34.5689, lng: 133.8895 };

// Google マップにスポットのピンを表示する。公開ページと管理画面で共用する
export function MapView({ spots, selectedId, onSelect, onMapClick, onSpotDrag }: Props) {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} language="ja" region="JP">
      <GoogleMap
        // ponytail: DEMO_MAP_ID は検証用。地図の見た目を変えたくなったら Cloud Console で Map ID を作る
        mapId="DEMO_MAP_ID"
        defaultCenter={SHIBUKAWA}
        defaultZoom={14}
        gestureHandling="greedy"
        disableDefaultUI
        className="h-full w-full"
        // ピンを置くときは、お店などのアイコンを押しても情報ウィンドウを開かない
        clickableIcons={!onMapClick}
        onClick={(e) => e.detail.latLng && onMapClick?.(e.detail.latLng)}
      >
        <FitToSpots spots={spots} />
        {spots.map((s) => (
          <AdvancedMarker
            key={s.id}
            position={s}
            title={s.name}
            onClick={() => onSelect?.(s.id)}
            draggable={!!onSpotDrag}
            onDragEnd={(e) => e.latLng && onSpotDrag?.(s.id, e.latLng.toJSON())}
            zIndex={s.id === selectedId ? 1 : 0}
          >
            {/* styles.css の --sea / --buoy / --ink と同じ色 */}
            <Pin
              background={s.id === selectedId ? "#ffc72c" : "#0e7fb8"}
              borderColor="#0b2e4f"
              glyphColor={s.id === selectedId ? "#0b2e4f" : "#fff"}
              scale={s.id === selectedId ? 1.3 : 1}
            />
          </AdvancedMarker>
        ))}
      </GoogleMap>
    </APIProvider>
  );
}

// 表示するスポットが変わったら（レイヤー切替など）、全部が収まる範囲に合わせる
function FitToSpots({ spots }: { spots: MapSpot[] }) {
  const map = useMap();
  const key = spots.map((s) => s.id).join();
  // biome-ignore lint/correctness/useExhaustiveDependencies: スポットの顔ぶれが変わったときだけ動かす
  useEffect(() => {
    if (!map) return;
    if (spots.length === 0) {
      map.setCenter(SHIBUKAWA);
      map.setZoom(14);
      return;
    }
    if (spots.length === 1) {
      map.setCenter(spots[0]);
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const s of spots) bounds.extend(s);
    map.fitBounds(bounds, 40);
  }, [map, key]);
  return null;
}
