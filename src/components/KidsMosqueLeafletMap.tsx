import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Mosque = { id: number; name: string; lat: number; lon: number };

function createEmojiIcon(emoji: string, size = 32) {
  return L.divIcon({
    html: `<span style="font-size:${size}px;line-height:1">${emoji}</span>`,
    className: "leaflet-emoji-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export default function KidsMosqueLeafletMap({ center, mosques }: { center: { lat: number; lon: number }; mosques: Mosque[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lon],
      zoom: 14,
      minZoom: 12,
      maxZoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OSM',
    }).addTo(map);

    // User marker
    L.marker([center.lat, center.lon], { icon: createEmojiIcon("📍", 28) })
      .addTo(map)
      .bindPopup("Toi 🧒");

    // Mosque markers
    mosques.forEach((m) => {
      if (m.lat && m.lon) {
        L.marker([m.lat, m.lon], { icon: createEmojiIcon("🕌", 28) })
          .addTo(map)
          .bindPopup(m.name || "Mosquée");
      }
    });

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [center.lat, center.lon, mosques]);

  return (
    <>
      <style>{`.leaflet-emoji-icon { background: none !important; border: none !important; }`}</style>
      <div ref={mapRef} className="h-64 rounded-2xl overflow-hidden border border-border shadow-md" />
    </>
  );
}
