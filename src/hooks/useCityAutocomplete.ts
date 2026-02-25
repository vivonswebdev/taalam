import { useState, useRef, useCallback } from "react";

export interface CityResult {
  city: string;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Reverse geocode lat/lng → city name using Nominatim (OpenStreetMap).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<CityResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { "User-Agent": "QuranEasy/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
    const country = addr.country || "";
    return {
      city,
      country,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      displayName: city && country ? `${city}, ${country}` : city || country || data.display_name || "",
    };
  } catch {
    return null;
  }
}

/**
 * Hook for city autocomplete search using Nominatim.
 */
export function useCityAutocomplete() {
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    // Clear previous
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&accept-language=fr`,
          { signal: controller.signal, headers: { "User-Agent": "QuranEasy/1.0" } }
        );
        if (!res.ok) { setResults([]); setLoading(false); return; }
        const data = await res.json();

        const cities: CityResult[] = data
          .filter((d: any) => d.address)
          .map((d: any) => {
            const addr = d.address;
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
            const country = addr.country || "";
            return {
              city,
              country,
              lat: parseFloat(d.lat),
              lng: parseFloat(d.lon),
              displayName: city && country ? `${city}, ${country}` : d.display_name,
            };
          })
          // Deduplicate by city+country
          .filter((c: CityResult, i: number, arr: CityResult[]) =>
            arr.findIndex((x) => x.city === c.city && x.country === c.country) === i
          );

        setResults(cities);
      } catch {
        // aborted or error
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setLoading(false);
  }, []);

  return { results, loading, search, clear };
}
