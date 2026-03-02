import { useEffect, useState, useRef } from 'react';
import { Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GeoData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

const WorldMap = () => {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [error, setError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          setGeo({ lat: data.latitude, lon: data.longitude, city: data.city, country: data.country_name });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!geo || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [geo.lat, geo.lon],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Pulsing marker
    const pulsingIcon = L.divIcon({
      className: 'pulsing-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      html: `
        <div style="position:relative;width:20px;height:20px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:hsl(39,100%,50%);opacity:0.8;animation:map-pulse 1.5s ease-out infinite;"></div>
          <div style="position:absolute;top:6px;left:6px;width:8px;height:8px;border-radius:50%;background:hsl(39,100%,60%);box-shadow:0 0 6px hsl(39,100%,50%);"></div>
        </div>
      `,
    });

    L.marker([geo.lat, geo.lon], { icon: pulsingIcon }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [geo]);

  return (
    <div className="bg-card rounded-2xl shadow-card p-5 flex flex-col">
      <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-secondary" />
        Ouvintes pelo Mundo
      </h2>
      <div className="relative flex-1 min-h-[250px] rounded-xl overflow-hidden bg-muted">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Localização indisponível
          </div>
        ) : !geo ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
            Carregando mapa...
          </div>
        ) : (
          <>
            <div ref={mapRef} className="absolute inset-0" />
            {geo.city && (
              <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-foreground z-[1000]">
                📍 {geo.city}, {geo.country}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
