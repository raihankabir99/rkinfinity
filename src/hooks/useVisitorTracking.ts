import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "rk_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface GeoData {
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
}

let geoCache: GeoData | null = null;
async function getGeo(): Promise<GeoData> {
  if (geoCache) return geoCache;
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return {};
    const j = await res.json();
    geoCache = {
      ip: j.ip,
      country: j.country_name,
      city: j.city,
      region: j.region,
    };
    return geoCache;
  } catch {
    return {};
  }
}

export function useVisitorTracking() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    if (lastPath.current === path) return;
    lastPath.current = path;

    const track = async () => {
      const sessionId = getSessionId();
      const geo = await getGeo();
      const payload = {
        session_id: sessionId,
        path,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        ip_address: geo.ip ?? null,
        country: geo.country ?? null,
        city: geo.city ?? null,
        region: geo.region ?? null,
      };
      try {
        await supabase.from("visitor_tracking").insert(payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("visitor tracking failed", err);
      }
    };
    void track();
  }, [location.pathname]);
}
