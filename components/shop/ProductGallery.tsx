"use client";

import { useState } from "react";

type Props = {
  images: string[];
  productName: string;
  fallback?: string;
};

export function ProductGallery({
  images,
  productName,
  fallback = "/placeholder-product.svg",
}: Props) {
  const list = images.length > 0 ? images : [fallback];
  const [active, setActive] = useState(0);
  const main = list[active] ?? fallback;

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm sm:aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-lg border-2 bg-white transition ${
                i === active
                  ? "border-[#febd69] ring-2 ring-[#febd69]/30"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
