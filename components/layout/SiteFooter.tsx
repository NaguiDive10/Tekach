import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-stone-500">
          © {new Date().getFullYear()} Tekach — Agent e-commerce omnicanal.
        </p>
        <div className="flex gap-6 text-xs text-stone-600">
          <Link href="/legal/confidentialite" className="hover:text-stone-900">
            Confidentialité & RGPD
          </Link>
          <Link href="/legal/mentions" className="hover:text-stone-900">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
