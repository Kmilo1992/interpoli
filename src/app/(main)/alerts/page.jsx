"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./page.module.css";
import CardAlert from "../../components/card-alert/CardAlert.jsx";
import { db } from "../../../service/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Spinner from "../../components/spinner/Spinner";

const Alerts = () => {
  const containerRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlerts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error en tiempo real:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div
      className={styles.scroll_container}
      ref={containerRef}
      role="region"
      aria-label="Lista de alertas"
    >
      {loading ? (
          <Spinner />
      ) : alerts.length === 0 ? (
        <p className={styles.empty}>No hay alertas creadas.</p>
      ) : (
        <section className={styles.container_cards}>
          {alerts.map((alert) => (
            <CardAlert key={alert.id} alert={alert} />
          ))}
        </section>
      )}
    </div>
  );
};

export default Alerts;
