import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type MapSpot = { id: string; name: string; lat: number; lng: number };

type Props = {
  spots: MapSpot[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

// スポットがないときの中心（仮の値。#32 のデータに合わせて直す）
const SHIBUKAWA = { lat: 34.5689, lng: 133.8895 };

// Google マップにスポットのピンを表示する。公開ページと管理画面で共用する
export function MapView({ spots, selectedId, onSelect }: Props) {
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
      >
        <FitToSpots spots={spots} />
        {spots.map((s) => (
          <AdvancedMarker
            key={s.id}
            position={s}
            title={s.name}
            onClick={() => onSelect(s.id)}
            zIndex={s.id === selectedId ? 1 : 0}
          >
            <Pin
              background={s.id === selectedId ? "#2563eb" : undefined}
              borderColor={s.id === selectedId ? "#1e40af" : undefined}
              glyphColor={s.id === selectedId ? "#fff" : undefined}
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
