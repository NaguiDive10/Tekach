"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryMenu } from "@/components/layout/CategoryMenu";

export function SiteHeader() {
  const { items } = useCart();
  const { user, loading } = useAuth();
  const count = items.reduce((s, l) => s + l.quantity, 0);
  const firstName =
    user?.displayName?.split(/\s+/)[0] ??
    user?.email?.split("@")[0] ??
    null;

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-[#131921] text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4">
          <Link
            href="/"
            className="shrink-0 rounded-sm border border-transparent px-1 py-1 text-lg font-bold tracking-tight outline-offset-2 hover:border-white/20 sm:text-xl"
          >
            Tekach
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <div className="flex h-10 overflow-hidden rounded-md">
              <div className="flex flex-1 items-center bg-white px-3 text-sm text-stone-600">
                Rechercher dans la boutique…
              </div>
              <div className="flex w-12 shrink-0 items-center justify-center bg-[#febd69] text-[#131921]">
                <span className="text-base" aria-hidden>
                  ⌕
                </span>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              href="/account"
              className="rounded-sm border border-transparent px-2 py-1 text-left outline-offset-2 hover:border-white/20"
            >
              <p className="text-[11px] leading-tight text-white/90">
                {loading
                  ? "…"
                  : user?.email
                    ? `Bonjour, ${firstName ?? "client"}`
                    : "Bonjour, identifiez-vous"}
              </p>
              <p className="text-xs font-bold leading-tight">
                {user?.email ? "Compte" : "Se connecter"}
              </p>
            </Link>

            <Link
              href="/cart"
              className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1 font-bold outline-offset-2 hover:border-white/20"
            >
              <span className="text-sm text-[#febd69]">Panier</span>
              {count > 0 ? (
                <span className="ml-0.5 min-w-[1.25rem] rounded-full bg-[#febd69] px-1.5 text-center text-xs font-bold text-[#131921]">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-4 bg-[#232f3e] px-3 py-2 text-sm text-white sm:px-4">
        <CategoryMenu />
        <Link href="/" className="hover:text-[#febd69]">
          Boutique
        </Link>
        <Link href="/tekach-ia" className="hover:text-[#febd69]">
          Tekach IA
        </Link>
        <Link href="/demo" className="hidden hover:text-[#febd69] sm:inline">
          Démo
        </Link>
        <Link
          href="/admin"
          className="ml-auto text-xs text-white/70 hover:text-[#febd69]"
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}
