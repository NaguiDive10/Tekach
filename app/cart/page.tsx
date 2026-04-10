"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, subtotal, setQuantity, removeLine } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-light text-stone-900">Panier vide</h1>
        <p className="mt-2 text-sm text-stone-500">
          Ajoutez des articles depuis la boutique.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm text-white"
        >
          Continuer
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-light text-stone-900">Panier</h1>
      <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
        {items.map((line) => (
          <li
            key={`${line.productId}-${line.variantId}`}
            className="flex flex-wrap items-center justify-between gap-4 py-6"
          >
            <div>
              <p className="text-sm font-medium text-stone-900">{line.title}</p>
              <p className="text-xs text-stone-500">
                {line.unitPrice.toFixed(2)} € × {line.quantity}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(
                    line.productId,
                    line.variantId,
                    Number(e.target.value) || 1,
                  )
                }
                className="w-16 rounded-lg border border-stone-200 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLine(line.productId, line.variantId)}
                className="text-xs text-stone-500 hover:text-red-600"
              >
                Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col items-end gap-4 border-t border-stone-200 pt-8">
        <p className="text-sm text-stone-600">
          Sous-total{" "}
          <span className="font-medium text-stone-900">
            {subtotal.toFixed(2)} €
          </span>
        </p>
        <p className="max-w-sm text-center text-xs text-stone-500">
          La commande nécessite un compte (Google ou email). Votre panier est
          enregistré sur cet appareil jusqu’à validation.
        </p>
        <Link
          href="/checkout"
          className="rounded-md bg-[#ffd814] px-8 py-3 text-sm font-medium text-[#0f1111] shadow-sm hover:bg-[#f7ca00]"
        >
          Passer commande
        </Link>
      </div>
    </div>
  );
}
