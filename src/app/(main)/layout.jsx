"use client";

import React, { useEffect, useRef } from "react";
import styles from "./layout.module.css";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/sidebar/page";
import { Toaster, toast } from "react-hot-toast";
import { db } from "../../service/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const Map = dynamic(() => import("../components/map/page"), { ssr: false });

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const router = useRouter();
  // const db = getFirestore();

  const prevAlertsRef = useRef([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    const alertsCollectionRef = collection(db, "alerts");

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
        // Mostrar toast para cada nueva alerta
        addedAlerts.forEach((alert) => {
          toast((t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                router.push(`/detail/${alert.id}`);
              }}
              style={{
                cursor: "pointer",
                color: "#fff",
                background: "#1e293b",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <strong>🚨 Nueva alerta:</strong> {alert.category || "Sin categoría"}
              <br />
              <strong>🌎 Ciudad:</strong> {alert.city || "Sin ubicación"}
              <br />
              <strong>📍 Lugar:</strong> {alert.neighborhood || "Sin ubicación"}
              <br />
              <small>Clic para ver</small>
            </div>
          ), {
            duration: 4000,
          });
        });

        prevAlertsRef.current = [...prevAlertsRef.current, ...addedAlerts];
      }
    });

    return () => unsub();
  }, [db, router]);

  return (
    <main className={styles.main_container}>
      <Toaster position="top-right" reverseOrder={false} />
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
