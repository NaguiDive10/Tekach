"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useIdToken } from "@/hooks/useIdToken";

type Summary = {
  tenantId?: string;
  tenantName?: string;
  events7d?: number;
  abandons7d?: number;
  note?: string;
};

type EventRow = {
  id: string;
  type?: string;
  createdAt?: number;
  sessionId?: string;
  identifiedEmail?: string | null;
};

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const { getToken } = useIdToken();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setSummary(null);
      setEvents([]);
      setDashLoading(false);
      return;
    }
    setErr(null);
    const headers = { Authorization: `Bearer ${token}` };
    const [sRes, eRes] = await Promise.all([
      fetch("/api/dashboard/summary", { headers }),
      fetch("/api/dashboard/events?limit=25", { headers }),
    ]);
    const s = await sRes.json();
    const e = await eRes.json();
    if (!sRes.ok) {
      setErr(s.error ?? "Erreur résumé");
      setSummary(null);
    } else {
      setSummary(s);
    }
    if (eRes.ok && e.events) setEvents(e.events);
    setDashLoading(false);
  }, [getToken]);

  useEffect(() => {
    if (loading) return;
    if (!user?.email) {
      setDashLoading(false);
      return;
    }
    setDashLoading(true);
    void load();
  }, [loading, user?.email, load]);

  if (loading || dashLoading) {
    return <p className="text-sm text-stone-600">Chargement du dashboard…</p>;
  }

  if (!user?.email) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-stone-600">
          Connectez-vous avec un compte autorisé (
          <Link href="/account" className="text-[#c45500] underline">
            Se connecter
          </Link>
          ) pour voir les données de votre tenant.
        </p>
        <p className="mt-4 text-xs text-stone-500">
          Les adresses listées dans{" "}
          <code className="rounded bg-stone-100 px-1">ADMIN_EMAILS</code> accèdent
          au tenant démo par défaut.
        </p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        {err}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-stone-500">Événements (7 j.)</p>
          <p className="mt-1 text-2xl font-semibold text-[#0f1111]">
            {summary?.events7d ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-stone-500">Abandons checkout (7 j.)</p>
          <p className="mt-1 text-2xl font-semibold text-[#0f1111]">
            {summary?.abandons7d ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-stone-500">Tenant</p>
          <p className="mt-1 text-sm font-medium text-[#0f1111]">
            {summary?.tenantName ?? summary?.tenantId ?? "—"}
          </p>
        </div>
      </div>

      {summary?.note ? (
        <p className="text-xs text-amber-800">{summary.note}</p>
      ) : null}

      <div>
        <h2 className="text-lg font-semibold text-[#0f1111]">
          Derniers événements
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-stone-500"
                  >
                    Aucun événement ingéré pour l’instant. Installez le SDK sur
                    votre site ou utilisez la{" "}
                    <Link href="/demo" className="text-[#c45500] underline">
                      boutique démo
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-mono text-xs">{ev.type}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {ev.createdAt
                        ? new Date(ev.createdAt).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-stone-500">
                      {ev.sessionId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {ev.identifiedEmail ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Documentation SDK &amp; IA :{" "}
        <Link href="/tekach-ia" className="text-[#c45500] hover:underline">
          Tekach IA
        </Link>
        {" · "}
        Recovery &amp; config :{" "}
        <Link href="/admin" className="text-[#c45500] hover:underline">
          Admin
        </Link>
      </p>
    </div>
  );
}
