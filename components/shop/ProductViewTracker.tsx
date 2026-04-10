"use client";

import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

export function ProductViewTracker({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const { track } = useTracking();
  useEffect(() => {
    void track("product_view", { productId, slug });
  }, [productId, slug, track]);
  return null;
}
