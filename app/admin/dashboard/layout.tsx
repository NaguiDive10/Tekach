import Link from "next/link";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Admin · Tekach Platform
          </p>
          <h1 className="text-xl font-semibold text-[#0f1111]">
            Dashboard événements
          </h1>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/admin/dashboard"
            className="text-[#c45500] hover:underline"
          >
            Vue d’ensemble
          </Link>
          <Link
            href="/admin/dashboard/install"
            className="text-stone-600 hover:text-[#0f1111]"
          >
            Intégration SDK
          </Link>
          <Link href="/tekach-ia" className="text-stone-600 hover:text-[#0f1111]">
            Tekach IA
          </Link>
          <Link href="/" className="text-stone-600 hover:text-[#0f1111]">
            Boutique
          </Link>
          <Link href="/demo" className="text-stone-600 hover:text-[#0f1111]">
            Démo
          </Link>
          <Link href="/admin" className="text-stone-600 hover:text-[#0f1111]">
            Admin recovery
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
