/**
 * SDK Tekach — tracking navigateur vers POST /api/v1/ingest
 */

export type TekachInitOptions = {
  publishableKey: string;
  /** URL complète de l’endpoint (défaut : origine courante + /api/v1/ingest) */
  endpoint?: string;
};

type InternalConfig = {
  publishableKey: string;
  endpoint: string;
};

let cfg: InternalConfig | null = null;

const SESSION_KEY = "tekach_session_id";

function defaultEndpoint(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/v1/ingest`;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return `sess_${Date.now()}`;
  try {
    let s = window.localStorage.getItem(SESSION_KEY);
    if (!s) {
      s =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export function init(opts: TekachInitOptions): void {
  cfg = {
    publishableKey: opts.publishableKey.trim(),
    endpoint: (opts.endpoint ?? defaultEndpoint()).replace(/\/$/, ""),
  };
  getOrCreateSessionId();
}

function ensureInit(): InternalConfig | null {
  if (cfg) return cfg;
  return null;
}

export type TrackPayload = Record<string, unknown>;

export async function track(
  type: string,
  payload?: TrackPayload,
): Promise<boolean> {
  const c = ensureInit();
  if (!c || !c.publishableKey) return false;
  const sessionId = getOrCreateSessionId();
  try {
    const res = await fetch(c.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tekach-Key": c.publishableKey,
      },
      body: JSON.stringify({
        sessionId,
        events: [{ type, payload: payload ?? {} }],
      }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type IdentifyOptions = {
  email?: string;
  userId?: string;
};

export async function identify(opts: IdentifyOptions): Promise<boolean> {
  const c = ensureInit();
  if (!c || !c.publishableKey) return false;
  const sessionId = getOrCreateSessionId();
  const identify: IdentifyOptions = {};
  if (opts.email) identify.email = opts.email;
  if (opts.userId) identify.userId = opts.userId;
  if (!identify.email && !identify.userId) return false;
  try {
    const res = await fetch(c.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tekach-Key": c.publishableKey,
      },
      body: JSON.stringify({
        sessionId,
        events: [],
        identify,
      }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** API globale type snippet script */
export const tekach = {
  init,
  track,
  identify,
};
