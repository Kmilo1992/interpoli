"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./layout.module.css";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/sidebar/page";
import { Toaster, toast } from "react-hot-toast";
import { getSession } from "../../utils/session";
import { db } from "../../service/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { TOAST_DURATION } from "../../utils/toast";
import { isSupported as notifSupported, wireOneTimeClickPermission, showNewAlertNotification } from "../../utils/notifications";

const Map = dynamic(() => import("../components/map/page"), { ssr: false });

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const router = useRouter();
  // const db = getFirestore();

  const prevAlertsRef = useRef([]);
  const initializedRef = useRef(false);
  const [hotToastTop, setHotToastTop] = useState(12);

  useEffect(() => {
    const alertsCollectionRef = collection(db, "alerts");
    // Preparar petición de permiso de notificaciones al primer clic del usuario
    try { if (notifSupported()) wireOneTimeClickPermission(); } catch {}

    const unsub = onSnapshot(alertsCollectionRef, (snapshot) => {
      const addedAlerts = [];
      const allAlerts = [];

      snapshot.forEach((doc) => {
        const alert = { id: doc.id, ...doc.data() };
        allAlerts.push(alert);

        // Detectar nuevas alertas (no en la lista anterior)
        if (!prevAlertsRef.current.some((a) => a.id === alert.id)) {
          addedAlerts.push(alert);
        }
      });

      // Primera carga → solo guardamos
      if (!initializedRef.current) {
        prevAlertsRef.current = allAlerts;
        initializedRef.current = true;
      } else if (addedAlerts.length > 0) {
        // Mostrar toasts a la derecha, apilándose debajo de otros toasts (reverseOrder=false)
        addedAlerts.forEach((a) => {
          const title = (a.category || "Alerta").toString();
          const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);
          const description = a.description || "Se ha reportado una alerta";
          const place = a.street || a.address || a.neighborhood || null;
          const city = a.city || a.department || a.province || null;

          toast.custom((t) => (
            <div
              onClick={() => {
                try {
                  const s = getSession();
                  const target = s?.isAdmin === true ? `/admin-detail/${a.id}` : `/detail/${a.id}`;
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("alert-selected", { detail: a.id }));
                  }
                  router.push(target);
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              role="button"
              tabIndex={0}
              style={{
                cursor: "pointer",
                background: "#111827",
                color: "#fff",
                padding: "12px 14px",
                borderRadius: 12,
                boxShadow: "0 10px 20px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxWidth: 360,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}>
                <span>🚨</span><strong>Nueva alerta</strong>: {description}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                <span>🌎</span><strong>Ciudad</strong>: {city || "Sin ciudad"}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                <span>📍</span><strong>Lugar</strong>: {place || "Sin ubicación"}
              </div>
              <span style={{ fontSize: 12, color: "#c7d2fe" }}>Clic para ver</span>
              <span
                aria-hidden="true"
                style={{
                  height: 2,
                  marginTop: 8,
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  animation: `shrink ${TOAST_DURATION}ms linear forwards`,
                }}
              />
              <style jsx>{`
                @keyframes shrink { from { width: 100%; } to { width: 0%; } }
              `}</style>
            </div>
          ), { id: `new-alert-${a.id}`, duration: TOAST_DURATION });
        });

        // Registrar nuevas alertas para no notificar de nuevo
        prevAlertsRef.current = [...prevAlertsRef.current, ...addedAlerts];

        // Notificaciones nativas del navegador (si hay permiso)
        try {
          const s = getSession();
          const isAdmin = s?.isAdmin === true;
          if (notifSupported()) {
            addedAlerts.forEach((a) => showNewAlertNotification(a, { isAdmin }));
          }
        } catch {}
      }
    });

    return () => unsub();
  }, [db, router]);

  // Ajustar el offset superior de los toasts (react-hot-toast) para que aparezcan debajo de los SweetAlert toasts
  useEffect(() => {
    const computeOffset = () => {
      try {
        // Buscar toasts reales de SweetAlert (no el contenedor de pantalla completa)
        const nodes = Array.from(document.querySelectorAll('.swal2-container.swal2-top-end .swal2-popup.swal2-toast'));
        if (nodes.length > 0) {
          const bottoms = nodes.map((n) => n.getBoundingClientRect().bottom);
          const maxBottom = Math.max(...bottoms);
          const offset = Math.max(12, Math.ceil(maxBottom) + 8);
          setHotToastTop(offset);
        } else {
          setHotToastTop(12);
        }
      } catch {
        setHotToastTop(12);
      }
    };
    computeOffset();
    const obs = new MutationObserver(computeOffset);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', computeOffset);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', computeOffset);
    };
  }, []);

  return (
    <main className={styles.main_container}>
      <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: hotToastTop }} />
      <div className={styles.section_sidebar}>
        <Sidebar />
      </div>

      <section className={styles.section_content}>
        <div
          className={`${styles.section_panel} ${!isRoot ? styles.open : ""}`}
          aria-hidden={isRoot ? "true" : "false"}
        >
          {children}
        </div>
        <div className={styles.section_map}>
          <Map />
        </div>
      </section>
    </main>
  );
};

export default MainLayout;
