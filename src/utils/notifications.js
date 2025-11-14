export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permission() {
  if (!isSupported()) return "unsupported";
  return window.Notification.permission;
}

export function markAsked() {
  try { window.localStorage.setItem("interpoli-notif-asked", "1"); } catch {}
}

export function alreadyAsked() {
  try { return window.localStorage.getItem("interpoli-notif-asked") === "1"; } catch { return false; }
}

export async function requestPermissionInteractive() {
  if (!isSupported()) return "unsupported";
  if (permission() !== "default") return permission();
  try {
    const res = await window.Notification.requestPermission();
    markAsked();
    return res;
  } catch {
    markAsked();
    return permission();
  }
}

export function wireOneTimeClickPermission() {
  if (!isSupported()) return;
  if (permission() !== "default") return;
  if (alreadyAsked()) return;
  const handler = async () => {
    try { await requestPermissionInteractive(); } finally {
      document.removeEventListener("click", handler, { capture: true });
    }
  };
  document.addEventListener("click", handler, { capture: true, once: true });
}

export function showNewAlertNotification(alert, { isAdmin = false } = {}) {
  if (!isSupported()) return false;
  if (permission() !== "granted") return false;
  try {
    const cat = (alert.category || "Alerta").toString();
    const title = `Nueva alerta: ${cat}`;
    const bodyParts = [];
    if (alert.city) bodyParts.push(`Ciudad: ${alert.city}`);
    const place = alert.street || alert.address || alert.neighborhood;
    bodyParts.push(`Lugar: ${place || "Sin ubicación"}`);
    const body = bodyParts.join("\n");
    const url = isAdmin ? `/admin-detail/${alert.id}` : `/detail/${alert.id}`;

    const n = new window.Notification(title, {
      body,
      tag: `alert-${alert.id}`,
      renotify: false,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url },
    });

    n.onclick = () => {
      try {
        window.focus();
        const u = n?.data?.url || url;
        if (u) window.location.href = u;
      } finally {
        try { n.close(); } catch {}
      }
    };
    return true;
  } catch {
    return false;
  }
}

