"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../service/firebase";
import styles from "./page.module.css";
import Link from "next/link";
import AdminDetail from "../../../components/admin-detail/AdminDetail.jsx";
import LeftLine from "../../../../assets/icons/arrow-left-line.svg";
import Spinner from "../../../components/spinner/Spinner";
import { useRouter } from "next/navigation";

import {
  updateAlertInFirestore,
  deleteAlertFromFirestore
} from "../../../../service/alerts";

const AdminChange = () => {
  const params = useParams();
  const id = params?.id;
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 500);
    const hasSession = document.cookie.includes("session=true");
    if (!hasSession) {
      router.push("/poliadmin");
    }

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
        <Link href="/admin">
          <LeftLine width={24} height={24} />
        </Link>
        <p>Regresar al listado de alertas</p>
      </div>

      <AdminDetail 
        alert={alert}
        onUpdate={(data) => updateAlertInFirestore(data)}
        onDelete={(id) => deleteAlertFromFirestore(id)}
      />
    </div>
  );
};

export default AdminChange;
