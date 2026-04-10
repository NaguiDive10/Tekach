"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { SERVICE_NAV_LINKS } from "@/lib/nav/serviceLinks";

export function CategoryMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = (await res.json()) as { categories?: Category[] };
        if (!cancelled && data.categories) {
          setCategories(
            [...data.categories].sort((a, b) => a.order - b.order),
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-medium text-white hover:text-[#febd69] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]"
      >
        <span className="text-base leading-none" aria-hidden>
          ☰
        </span>
        Tout
        <span className="text-[10px] opacity-80" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-[60] mt-1 max-h-[min(70vh,520px)] w-[min(100vw-1.5rem,320px)] overflow-y-auto rounded-md border border-stone-200 bg-white py-1 text-sm text-[#0f1111] shadow-lg sm:max-h-[min(80vh,560px)] sm:w-80"
        >
          <Link
            href="/"
            role="menuitem"
            className="block px-4 py-2.5 font-medium hover:bg-stone-100"
            onClick={close}
          >
            Toute la boutique
          </Link>
          <div
            className="my-1 border-t border-stone-200 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400"
            role="presentation"
          >
            Rayons
          </div>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop/${c.slug}`}
              role="menuitem"
              className="block px-4 py-2.5 hover:bg-stone-100"
              onClick={close}
            >
              {c.name}
            </Link>
          ))}
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-xs text-stone-500">Chargement…</p>
          ) : null}
          <div
            className="my-1 border-t border-stone-200 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400"
            role="presentation"
          >
            Services
          </div>
          {SERVICE_NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-4 py-2.5 text-stone-700 hover:bg-stone-100"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
