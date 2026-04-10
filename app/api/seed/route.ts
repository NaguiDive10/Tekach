import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/config";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Admin Firebase non configuré" },
      { status: 500 },
    );
  }
  const batch = db.batch();
  for (const c of SEED_CATEGORIES) {
    batch.set(db.collection("categories").doc(c.id), {
      name: c.name,
      slug: c.slug,
      order: c.order,
    });
  }
  for (const p of SEED_PRODUCTS) {
    const { id, ...rest } = p;
    batch.set(db.collection("products").doc(id), rest);
  }
  batch.set(db.collection("adminConfig").doc("global"), DEFAULT_ADMIN_CONFIG, {
    merge: true,
  });
  await batch.commit();
  return NextResponse.json({ ok: true, seeded: SEED_PRODUCTS.length });
}
