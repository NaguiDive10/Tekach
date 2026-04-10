/** Types acceptés par le SDK public (snake_case / naming libre) → stockage interne. */
export function normalizeIngestEventType(raw: string): string {
  const t = raw.trim();
  const map: Record<string, string> = {
    view_product: "product_view",
    page_visit: "page_view",
    purchase: "order_completed",
  };
  return map[t] ?? t;
}
