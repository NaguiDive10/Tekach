"use client";

import { useCallback, useEffect, useRef } from "react";
import { init, track as tekachTrack, identify } from "@tekach/sdk";
import type { TrackingEventType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTracking() {
  const { user } = useAuth();
  const initRef = useRef(false);
  const identifiedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TEKACH_PUBLISHABLE_KEY?.trim();
    if (!key || initRef.current || typeof window === "undefined") return;
    init({ publishableKey: key });
    initRef.current = true;
  }, []);

  useEffect(() => {
    const email = user?.email ?? null;
    if (!email || email === identifiedEmailRef.current) return;
    identifiedEmailRef.current = email;
    void identify({ email });
  }, [user?.email]);

  const track = useCallback(
    async (type: TrackingEventType, payload?: Record<string, unknown>) => {
      if (typeof window === "undefined") return;
      await tekachTrack(type, payload);
    },
    [],
  );

  return { track };
}
