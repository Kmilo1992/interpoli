// src/utils/timeAgo.js
export function timeAgo(isoDate) {
  if (!isoDate) return "";
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.floor((now - then) / 1000); // segundos

  if (diff < 60) return `hace ${diff} seg${diff !== 1 ? "s" : ""}`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `hace ${mins} min${mins !== 1 ? "s" : ""}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}
