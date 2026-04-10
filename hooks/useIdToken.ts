"use client";

import { useCallback, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";

export function useIdToken() {
  const [loading, setLoading] = useState(false);

  const getToken = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth?.currentUser) return null;
    setLoading(true);
    try {
      return await auth.currentUser.getIdToken();
    } finally {
      setLoading(false);
    }
  }, []);

  return { getToken, loading };
}
