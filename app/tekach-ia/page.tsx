import Link from "next/link";
import { SdkInstallSection } from "@/components/tekach/SdkInstallSection";

export default function TekachIaPage() {
  return (
    <div className="space-y-16 pb-12">
      <section className="relative overflow-hidden rounded-xl bg-[#131921] px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#febd69]">
            Tekach IA &amp; plateforme
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            SDK, ingestion et pilotage des relances
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/85">
            Cette page regroupe la documentation d’intégration JavaScript (script
            embarqué), la clé publique et le lien vers l’analytics dans
            l’administration.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-md bg-[#febd69] px-6 py-3 text-sm font-semibold text-[#131921] shadow-lg hover:bg-[#f3a847]"
            >
              Dashboard événements (Admin)
            </Link>
            <Link
              href="/"
              className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-white/20"
            >
              Retour boutique
            </Link>
            <Link
              href="/account"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Connexion marchand
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {[
          {
            title: "SDK embarqué",
            body: "Initialisation avec clé publique, événements (vues produit, panier, tunnel), identification des contacts.",
          },
          {
            title: "Backend Tekach",
            body: "POST /api/v1/ingestion, stockage multi-tenant, webhooks n8n pour emails et automations.",
          },
          {
            title: "Pilotage",
            body: "KPIs et derniers hits dans Admin → Dashboard ; recovery historique sous /admin.",
          },
        ].map((b) => (
          <div
            key={b.title}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[#0f1111]">{b.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{b.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl">
        <h2 className="text-lg font-semibold text-[#0f1111]">
          Script &amp; clé (SDK)
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Même contenu que dans l’admin (section intégration), pour consultation
          publique ou partage avec vos développeurs.
        </p>
        <div className="mt-8">
          <SdkInstallSection />
        </div>
      </section>

      <section className="mx-auto max-w-2xl rounded-xl border border-stone-200 bg-stone-50 px-6 py-10 text-center">
        <h2 className="text-lg font-semibold text-[#0f1111]">Parcours type</h2>
        <ol className="mt-6 space-y-3 text-left text-sm text-stone-600">
          <li>1. Installer le script et initialiser avec la clé publique.</li>
          <li>2. Les événements sont rattachés au tenant côté serveur.</li>
          <li>3. n8n (ou autre) consomme les abandons pour l’email de relance.</li>
          <li>4. Suivez les volumes dans Admin → Dashboard.</li>
        </ol>
        <p className="mt-8 text-xs text-stone-500">
          Référence développeur :{" "}
          <code className="rounded bg-white px-1.5 py-0.5">packages/sdk/README.md</code>
        </p>
      </section>
    </div>
  );
}
