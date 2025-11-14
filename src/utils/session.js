export const SESSION_KEY = "interpoli-session";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, ...v] = c.split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function setCookie(name, value, options = {}) {
  if (typeof document === "undefined") return;
  const {
    path = "/",
    maxAge = 60 * 60 * 24 * 7, // 7 días
    sameSite = "Lax",
  } = options;
  let cookie = `${name}=${value}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  // Nota: no usamos Secure por compatibilidad en dev (http)
  document.cookie = cookie;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = getCookie(SESSION_KEY);
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function setSession(session) {
  if (typeof window === "undefined") return;
  try {
    const value = encodeURIComponent(JSON.stringify(session));
    setCookie(SESSION_KEY, value, { maxAge: 60 * 60 * 24 * 7 });
  } finally {
    try {
      window.dispatchEvent(new Event("session-changed"));
      // Señal para propagar entre pestañas
      window.localStorage.setItem("interpoli-session-signal", Date.now().toString());
    } catch {}
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    deleteCookie(SESSION_KEY);
  } finally {
    try {
      window.dispatchEvent(new Event("session-changed"));
      // Señal para propagar entre pestañas
      window.localStorage.setItem("interpoli-session-signal", Date.now().toString());
    } catch {}
  }
}
