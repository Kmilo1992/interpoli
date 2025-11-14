"use client";

import React, { useEffect, useState } from "react";
import styles from "./overlay.module.css";
import { TOAST_DURATION } from "../../../utils/toast";

export default function NewAlertsOverlay({ items, onOpen }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!items || items.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [items?.length]);

  if (!items || items.length === 0) return null;
  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      {items.map((it) => (
        <div
          key={it.id}
          className={`${styles.card} ${it.expiresAt && it.expiresAt - now <= 180 ? styles.leaving : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onOpen?.(it)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpen?.(it);
          }}
          style={{ ["--duration"]: `${TOAST_DURATION}ms` }}
        >
          <div className={styles.line}><span className={styles.emoji}>🚨</span><strong>Nueva alerta</strong>: {it.title}</div>
          <div className={styles.line}><span className={styles.emoji}>🌎</span><strong>Ciudad</strong>: {it.city || "Sin ciudad"}</div>
          <div className={styles.line}><span className={styles.emoji}>📍</span><strong>Lugar</strong>: {it.place || "Sin ubicación"}</div>
          <div className={styles.hint}>Clic para ver</div>
          <span className={styles.progress} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
