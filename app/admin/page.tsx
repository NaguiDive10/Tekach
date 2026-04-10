"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIdToken } from "@/hooks/useIdToken";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminConfig = {
  recoveryMode: "email" | "voice";
  voiceCartMinEuros: number;
  callDelayMinutes: number;
  discountPercentMax: number;
  cartValueForNegotiationEuros: number;
  defaultSiteId: string;
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { getToken } = useIdToken();
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [abandons, setAbandons] = useState<Record<string, unknown>[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [dashLoading, setDashLoading] = useState(false);
  const [logSiteFilter, setLogSiteFilter] = useState("");
  const logSiteFilterRef = useRef("");
  logSiteFilterRef.current = logSiteFilter;

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const cRes = await fetch("/api/admin/config", { headers });
    const c = await cRes.json();
    if (cRes.status === 403 || c.error === "Interdit") {
      setForbidden(true);
      setConfig(null);
      return;
    }
    setForbidden(false);
    if (c.config) setConfig(c.config);
    const filterQ = logSiteFilterRef.current.trim();
    const logsPath =
      filterQ.length > 0
        ? `/api/admin/logs?siteId=${encodeURIComponent(filterQ)}`
        : "/api/admin/logs";
    const [s, l, a] = await Promise.all([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch(logsPath, { headers }).then((r) => r.json()),
      fetch("/api/admin/abandons", { headers }).then((r) => r.json()),
    ]);
    if (!s.error) setStats(s);
    setLogs(l.logs ?? []);
    setAbandons(a.abandons ?? []);
  }, [getToken]);

  useEffect(() => {
    if (loading || !user?.email) return;
    setDashLoading(true);
    void load().finally(() => setDashLoading(false));
  }, [loading, user, load]);

  const saveConfig = async (patch: Partial<AdminConfig>) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.config) setConfig(data.config);
  };

  if (loading) {
    return <p className="text-sm text-stone-500">Chargement…</p>;
  }

  if (!user?.email) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">
        Connectez-vous avec un compte email autorisé (voir{" "}
        <code className="rounded bg-stone-100 px-1">ADMIN_EMAILS</code> dans
        l’environnement serveur).
      </div>
    );
  }

  if (dashLoading) {
    return <p className="text-sm text-stone-500">Chargement du tableau de bord…</p>;
  }

  if (forbidden || !config) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-900">
        Accès admin refusé pour {user.email}. Ajoutez cette adresse à{" "}
        <code className="rounded bg-amber-100 px-1">ADMIN_EMAILS</code> puis
        redémarrez le serveur.
      </div>
    );
  }

  const chartData = stats
    ? [
        { name: "CA total", value: stats.totalRevenue ?? 0 },
        { name: "Récupéré", value: stats.recoveredRevenue ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light text-stone-900">Admin Tekach</h1>
        <p className="mt-2 text-sm text-stone-500">
          Grille type bento — ventes, abandons, logs agent, configuration
          relance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Bento title="Recovery rate" accent>
          <p className="text-3xl font-light">
            {stats?.recoveryRate ?? 0}
            <span className="text-lg">%</span>
          </p>
          <p className="text-xs text-stone-500">Commandes marquées « recovery »</p>
        </Bento>
        <Bento title="AOV reconquis">
          <p className="text-3xl font-light">
            {(stats?.aovRecovered ?? 0).toFixed(0)} €
          </p>
        </Bento>
        <Bento title="Commandes">
          <p className="text-3xl font-light">{stats?.ordersCount ?? 0}</p>
        </Bento>
        <Bento title="CA total">
          <p className="text-3xl font-light">
            {(stats?.totalRevenue ?? 0).toFixed(0)} €
          </p>
        </Bento>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Bento title="Ventes vs récupéré" className="lg:col-span-2">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#292524" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Bento>
        <Bento title="Relance">
          <label className="text-xs text-stone-500">Canal</label>
          <select
            value={config.recoveryMode}
            onChange={(e) =>
              void saveConfig({
                recoveryMode: e.target.value as AdminConfig["recoveryMode"],
              })
            }
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          >
            <option value="email">Email</option>
            <option value="voice">Appel vocal IA</option>
          </select>
          <label className="mt-4 block text-xs text-stone-500">
            Seuil panier appel (€)
          </label>
          <input
            type="number"
            value={config.voiceCartMinEuros}
            onChange={(e) =>
              setConfig((c) =>
                c
                  ? { ...c, voiceCartMinEuros: Number(e.target.value) }
                  : c,
              )
            }
            onBlur={() => void saveConfig({ voiceCartMinEuros: config.voiceCartMinEuros })}
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
          <label className="mt-4 block text-xs text-stone-500">
            Délai appel (min)
          </label>
          <input
            type="number"
            value={config.callDelayMinutes}
            onChange={(e) =>
              setConfig((c) =>
                c
                  ? { ...c, callDelayMinutes: Number(e.target.value) }
                  : c,
              )
            }
            onBlur={() => void saveConfig({ callDelayMinutes: config.callDelayMinutes })}
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
          <label className="mt-4 block text-xs text-stone-500">
            Site par défaut (multi-boutiques)
          </label>
          <input
            type="text"
            value={config.defaultSiteId}
            onChange={(e) =>
              setConfig((c) =>
                c ? { ...c, defaultSiteId: e.target.value } : c,
              )
            }
            onBlur={() => void saveConfig({ defaultSiteId: config.defaultSiteId })}
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
            placeholder="default"
            title="Utilisé si le webhook n’envoie pas siteId"
          />
          <p className="mt-4 text-[11px] text-stone-500">
            Remise max négociation : {config.discountPercentMax} % · Seuil négociation
            : {config.cartValueForNegotiationEuros} €
          </p>
        </Bento>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bento title="Abandons récents">
          <ul className="max-h-64 space-y-2 overflow-auto text-xs">
            {abandons.length === 0 && (
              <li className="text-stone-500">Aucun événement récent.</li>
            )}
            {abandons.map((a) => (
              <li
                key={String(a.id)}
                className="rounded-lg bg-stone-50 px-3 py-2 text-stone-700"
              >
                {String(a.userId ?? "")} — {String(a.exitStep ?? "")}
              </li>
            ))}
          </ul>
        </Bento>
        <Bento title="Logs agent / relances">
          <label className="block text-xs text-stone-500">
            Filtrer par siteId
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={logSiteFilter}
              onChange={(e) => setLogSiteFilter(e.target.value)}
              onBlur={() => void load()}
              className="w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs"
              placeholder="Laisser vide = tous"
            />
            <button
              type="button"
              onClick={() => void load()}
              className="shrink-0 rounded-xl border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
            >
              Actualiser
            </button>
          </div>
          <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-xs">
            {logs.length === 0 && (
              <li className="text-stone-500">Aucun log.</li>
            )}
            {logs.map((log) => (
              <li
                key={String(log.id)}
                className="rounded-lg bg-stone-50 px-3 py-2 text-stone-700"
              >
                <span className="font-medium">{String(log.status ?? "")}</span>{" "}
                · {String(log.channel ?? "")}
                {log.siteId != null && log.siteId !== "" ? (
                  <span className="text-stone-500">
                    {" "}
                    · site: {String(log.siteId)}
                  </span>
                ) : null}
                {log.transcript ? (
                  <p className="mt-1 text-stone-500 line-clamp-2">
                    {String(log.transcript)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Bento>
      </div>
    </div>
  );
}

function Bento({
  title,
  children,
  className = "",
  accent = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        accent
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-200 bg-white"
      } ${className}`}
    >
      <h3
        className={`text-xs font-medium uppercase tracking-wider ${
          accent ? "text-stone-300" : "text-stone-500"
        }`}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
