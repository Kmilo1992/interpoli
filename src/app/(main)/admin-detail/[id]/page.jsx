"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../../../../service/firebase";
import styles from "./page.module.css";
import Link from "next/link";
import AdminDetail from "../../../components/admin-detail/AdminDetail.jsx";
import AdminReadOnly from "../../../components/admin-detail/AdminReadOnly.jsx";
import { getSession } from "../../../../utils/session";
import LeftLine from "../../../../assets/icons/arrow-left-line.svg";
import Spinner from "../../../components/spinner/Spinner";

import {
  updateAlertInFirestore,
  deleteAlertFromFirestore
} from "../../../../service/alerts";

const AdminChange = () => {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const isEdit = (searchParams?.get("edit") ?? "").toString() !== "";
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);
  const router = useRouter();
  const [sessionState, setSessionState] = useState(() => getSession());

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 500);
    let unsubscribe = null;

    const init = async () => {
      const s = getSession();
      if (s) {
        setSessionState(s);
      } else {
        const u = auth?.currentUser || null;
        if (!u) {
          router.push("/poliadmin");
          clearTimeout(timer);
          return;
        }
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          const data = snap.exists() ? (snap.data() || {}) : {};
          setSessionState({ uid: u.uid, username: u.email || "", isAdmin: data.isAdmin === true });
        } catch (e) {
          console.error("No se pudo obtener rol/sesión:", e);
          router.push("/poliadmin");
          clearTimeout(timer);
          return;
        }
      }

      if (id) {
        const docRef = doc(db, "alerts", id);
        unsubscribe = onSnapshot(
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
      }
    };

    init();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      clearTimeout(timer);
    };
  }, [id, router]);

  if (!id) return <div style={{ padding: 16 }}>ID no especificado.</div>;

  if (loading || minLoading) {
    return <Spinner />;
  }

  if (!alert) return <div style={{ padding: 16 }}>Alerta no encontrada.</div>;

  const isOwner = sessionState && alert && (
    (alert.createdByUid && alert.createdByUid === sessionState.uid) ||
    (alert.createdByUsername && alert.createdByUsername === sessionState.username)
  );
  const canEdit = (sessionState?.isAdmin === true) || isOwner;
  const canDelete = sessionState?.isAdmin === true;

  return (
    <div className={styles.detail_container}>
      <div className={styles.detail_header}>
        <Link href="/admin">
          <LeftLine width={24} height={24} />
        </Link>
        <p>Regresar al listado de alertas</p>
      </div>

      {isEdit && canEdit ? (
        <AdminDetail 
          alert={alert}
          onUpdate={(data) => updateAlertInFirestore(data)}
          onDelete={(id) => deleteAlertFromFirestore(id)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <AdminReadOnly alert={alert} canEdit={canEdit} />
      )}
    </div>
  );
};

export default AdminChange;
