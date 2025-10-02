"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../service/firebase";
import styles from "./page.module.css";
import Link from "next/link";
import DetailAlert from "../../../components/detail-alert/DetailAlert";
import LeftLine from "../../../../assets/icons/arrow-left-line.svg";
import Spinner from "../../../components/spinner/Spinner";

const Detail = () => {
  const params = useParams();
  const id = params?.id;
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    // Delay artificial de 2 segundos
    const timer = setTimeout(() => setMinLoading(false), 500);

    if (id) {
      const docRef = doc(db, "alerts", id);
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            setAlert({ id: snap.id, ...snap.data() });
          } else {
            setAlert(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error al leer detalle:", err);
          setLoading(false);
        }
      );
      return () => {
        unsub();
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, [id]);

  if (!id) return <div style={{ padding: 16 }}>ID no especificado.</div>;

  if (loading || minLoading) {
    return <Spinner />;
  }

  if (!alert) return <div style={{ padding: 16 }}>Alerta no encontrada.</div>;

  return (
    <div className={styles.detail_container}>
      <div className={styles.detail_header}>
        <Link href="/alerts">
          <LeftLine width={24} height={24} />
        </Link>
        <p>Regresar al listado de alertas</p>
      </div>
      <DetailAlert alert={alert} />
    </div>
  );
};

export default Detail;
