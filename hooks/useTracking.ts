"use client";

import { useCallback } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { TrackingEventType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTracking() {
  const { user } = useAuth();

  const track = useCallback(
    async (type: TrackingEventType, payload?: Record<string, unknown>) => {
      if (!user?.email) return;
      const db = getClientDb();
      if (!db) return;
      try {
        await addDoc(collection(db, "events"), {
          userId: user.uid,
          userEmail: user.email,
          type,
          payload: payload ?? {},
          createdAt: Date.now(),
        });
      } catch {
        /* ignore */
      }
    },
    [user],
  );

  return { track };
}
