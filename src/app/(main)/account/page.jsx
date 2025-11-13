"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { getSession, clearSession } from "../../../utils/session";
import { useRouter } from "next/navigation";
import { db } from "../../../service/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Spinner from "../../components/spinner/Spinner";
import CardAlert from "../../components/card-alert/CardAlert.jsx";
import { alertTypeOptions } from "../../data/alertType";
import Image from "next/image";
import filterIcon from "../../../assets/icons/filter_alerts.png";
import { signOut } from "firebase/auth";
import { auth } from "../../../service/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Toast } from "../../../utils/toast";

const AccountPage = () => {
  const router = useRouter();
  const [session, setSessionState] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterWrapRef = useRef(null);

  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (getSession()) return; // prefer local session
      if (!u) return;
      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() || {}) : {};
        setSessionState({ uid: u.uid, username: u.email || "", name: data.name || "", ID: data.ID || "", isAdmin: data.isAdmin === true });
      } catch (e) {
        console.error("No se pudo leer perfil:", e);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando alertas del usuario:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const myAlerts = useMemo(() => {
    if (!session) return [];
    const base = alerts.filter(
      (a) => a.createdByUid === session.uid || a.createdByUsername === session.username
    );
    let out = base;
    if (selectedTypes.length) {
      out = out.filter((a) => selectedTypes.includes((a.category || "").toLowerCase()));
    }
    if (selectedLevels.length) {
      out = out.filter((a) => selectedLevels.includes(a.priority));
    }
    return out;
  }, [alerts, session, selectedTypes, selectedLevels]);

  const toggleType = (value) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const toggleLevel = (value) => {
    setSelectedLevels((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedLevels([]);
  };

  // Anunciar filtros al mapa (igual que en vistas de alertas)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("alerts-filters-changed", {
          detail: { types: selectedTypes, levels: selectedLevels },
        })
      );
    }
  }, [selectedTypes, selectedLevels]);

  const doLogout = async () => {
    try {
      clearSession();
      await signOut(auth).catch(() => {});
      Toast.fire({ icon: "success", title: "Sesión cerrada" });
    } catch (e) {
      console.error(e);
      Toast.fire({ icon: "error", title: "No se pudo cerrar sesión" });
    } finally {
      router.push("/");
    }
  };

  if (!session) {
    return (
      <div className={styles.container_empty}>
        <h1 className={styles.title}>Cuenta</h1>
        <p className={styles.subtitle}>No has iniciado sesión.</p>
        <div className={styles.actions_row}>
          <button className={styles.primary_btn} onClick={() => router.push("/poliadmin")}>Iniciar sesión</button>
          <button className={styles.secondary_btn} onClick={() => router.push("/signup")}>Crear cuenta</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.header_row}>
          <div>
            <h1 className={styles.title}>Cuenta</h1>
            <p className={styles.name}>{session.name || session.username}</p>
            {session.ID ? <p className={styles.id}>ID: {session.ID}</p> : null}
          </div>
          {session.isAdmin ? (
            <button className={styles.admin_btn} onClick={() => router.push("/admin")}>Ir al panel Admin</button>
          ) : null}
        </div>
      </div>

      <div className={styles.alerts_block}>
        <div className={styles.block_header}>
          <h2 className={styles.block_title}>Mis alertas</h2>
          <div className={styles.topbar_actions}>
            {(selectedTypes.length > 0 || selectedLevels.length > 0) && (
              <button type="button" className={styles.clear_button} onClick={clearAllFilters}>
                Limpiar filtros
              </button>
            )}
            <div className={styles.filter_wrap} ref={filterWrapRef}>
              <button
                type="button"
                className={styles.filter_button}
                onClick={() => setFiltersOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={filtersOpen}
                aria-label="Abrir filtros"
              >
                <Image src={filterIcon} alt="Filtros" className={styles.filter_icon} />
              </button>
              {filtersOpen && (
                <div className={styles.dropdown} role="listbox" aria-label="Filtros de tipo">
                  <div className={styles.dropdown_list}>
                    {alertTypeOptions.map((opt) => {
                      const value = opt.value;
                      const label = opt.label;
                      const selected = selectedTypes.includes(value);
                      return (
                        <button
                          type="button"
                          key={value}
                          className={styles.dropdown_item}
                          onClick={() => toggleType(value)}
                          aria-pressed={selected}
                        >
                          <span className={`${styles.checkbox} ${selected ? styles.checked : ""}`} aria-hidden="true">
                            {selected ? "✓" : ""}
                          </span>
                          <span className={styles.item_label}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <hr className={styles.dropdown_divider} />
                  <div className={styles.dropdown_list} aria-label="Filtrar por prioridad">
                    {["Alta", "Media", "Baja"].map((lv) => {
                      const selected = selectedLevels.includes(lv);
                      return (
                        <button
                          type="button"
                          key={lv}
                          className={styles.dropdown_item}
                          onClick={() => toggleLevel(lv)}
                          aria-pressed={selected}
                        >
                          <span className={`${styles.checkbox} ${selected ? styles.checked : ""}`} aria-hidden="true">
                            {selected ? "✓" : ""}
                          </span>
                          <span className={styles.item_label}>{lv}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.spinner_center}><Spinner /></div>
        ) : myAlerts.length === 0 ? (
          <p className={styles.empty}>No has creado alertas.</p>
        ) : (
          <section className={styles.cards}>
            {myAlerts.map((a) => (
              <CardAlert key={a.id} alert={a} />
            ))}
          </section>
        )}
      </div>

      <div className={styles.footer_actions}>
        <button className={styles.danger_btn} onClick={doLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default AccountPage;
