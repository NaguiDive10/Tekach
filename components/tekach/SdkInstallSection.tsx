import { getDemoPublishableKey } from "@/lib/tenants/seed-default";

export function SdkInstallSection() {
  const pk = getDemoPublishableKey();
  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://votre-domaine.com";

  const snippet = `<!-- Tekach SDK -->
<script src="${origin}/sdk/v1.js" async></script>
<script>
  window.addEventListener("load", function () {
    if (!window.tekach) return;
    tekach.init({ publishableKey: "${pk}" });
    tekach.track("page_view", { path: location.pathname });
  });
</script>`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0f1111]">
          Intégration du script
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Collez ce snippet avant la balise{" "}
          <code className="rounded bg-stone-100 px-1">&lt;/body&gt;</code> sur
          chaque page du site e-commerce. Les événements sont envoyés à
          l’endpoint public d’ingestion Tekach (en-tête{" "}
          <code className="rounded bg-stone-100 px-1">X-Tekach-Key</code>).
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-stone-500">
          Clé publique (démo / env{" "}
          <code className="rounded bg-stone-100 px-1">
            NEXT_PUBLIC_TEKACH_PUBLISHABLE_KEY
          </code>
          )
        </p>
        <code className="mt-2 block rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
          {pk}
        </code>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-stone-200 bg-[#131921] p-4 text-xs text-emerald-100">
        {snippet}
      </pre>

      <p className="text-xs text-stone-500">
        En production, servez{" "}
        <code className="rounded bg-stone-100 px-1">/sdk/v1.js</code> depuis
        votre domaine (build :{" "}
        <code className="rounded bg-stone-100 px-1">npm run build:sdk</code>
        ). Définissez{" "}
        <code className="rounded bg-stone-100 px-1">NEXT_PUBLIC_APP_ORIGIN</code>{" "}
        pour des URLs correctes dans ce bloc.
      </p>
    </div>
  );
}
