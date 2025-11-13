"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Admin from "../../components/admin/PanelAdmin.jsx";
import { db } from "../../../service/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Spinner from "../../components/spinner/Spinner";
import { alertTypeOptions } from "../../data/alertType";
import Image from "next/image";
import filterIcon from "../../../assets/icons/filter_alerts.png";
import { clearSession } from "../../../utils/session";

const Adminlist = () => {
  const containerRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterWrapRef = useRef(null);
  const router = useRouter();



  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const hasSession = document.cookie.includes("session=true");
    if (!hasSession) {
      router.push("/poliadmin");
    }

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

  const toggleType = (value) => {
    setSelectedTypes((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const toggleLevel = (value) => {
    setSelectedLevels((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedLevels([]);
  };

  // Anunciar filtros al mapa
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("alerts-filters-changed", {
          detail: { types: selectedTypes, levels: selectedLevels },
        })
      );
    }
  }, [selectedTypes, selectedLevels]);

  const displayedAlerts = useMemo(() => {
    let out = alerts;
    if (selectedTypes.length) {
      out = out.filter((a) =>
        selectedTypes.includes((a.category || "").toLowerCase())
      );
    }
    if (selectedLevels.length) {
      out = out.filter((a) => selectedLevels.includes(a.priority));
    }
    return out;
  }, [alerts, selectedTypes, selectedLevels]);

  // Close dropdown on click outside or pressing Esc
  useEffect(() => {
    if (!filtersOpen) return;

    const handleClick = (e) => {
      if (!filterWrapRef.current) return;
      if (!filterWrapRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };

    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("touchstart", handleClick, true);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("touchstart", handleClick, true);
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [filtersOpen]);

  const logout = () => {
    try {
      clearSession();
    } catch {}
    try {
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    } catch {}
    router.push("/");
  };

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
        <>
          <div className={styles.topbar}>
            <div className={styles.topbar_actions}>
             <div className="container">
              <button 
                type="button"
                className={styles.logout_button}
                onClick={logout}
                >
                Cerrar sesión
              </button>
            </div>
              {(selectedTypes.length > 0 || selectedLevels.length > 0) && (
                <button
                  type="button"
                  className={styles.clear_button}
                  onClick={clearAllFilters}
                >
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
                          <span
                            className={`${styles.checkbox} ${selected ? styles.checked : ""}`}
                            aria-hidden="true"
                          >
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
                          <span
                            className={`${styles.checkbox} ${selected ? styles.checked : ""}`}
                            aria-hidden="true"
                          >
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

          <section className={styles.container_cards}>
            {displayedAlerts.map((alert) => (
              <Admin key={alert.id} alert={alert} />
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Adminlist;
