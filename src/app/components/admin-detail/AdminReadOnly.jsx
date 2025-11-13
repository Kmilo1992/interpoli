"use client";

import React from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { alertImages } from "../../../utils/alertImages";

const AdminReadOnly = ({ alert }) => {
  const router = useRouter();

  const imageSrc =
    alert.mapImage ||
    alertImages[alert.category?.toLowerCase()] ||
    "/images/alerts/otro.jpg";

  const priorityClass =
    (alert.priority || "").toLowerCase() === "alta"
      ? `${styles.priority} ${styles.alta}`
      : (alert.priority || "").toLowerCase() === "media"
      ? `${styles.priority} ${styles.media}`
      : `${styles.priority} ${styles.baja}`;

  const goEdit = () => {
    // Navega al modo de edición de esta alerta en la misma ruta
    const url = `/admin-detail/${alert.id}?edit=1`;
    router.push(url);
  };

  return (
    <div className={styles.detail_container}>
      <div className={styles.image_wrapper}>
        <img src={imageSrc} alt={alert.category} className={styles.image} />
      </div>

      <div className={`${styles.header} ${styles.header_row}`}>
        <h1 className={styles.title}>
          {alert.category || "Alerta"}
        </h1>
        <button className={styles.edit_button} onClick={goEdit}>
          Editar
        </button>
      </div>

      <div className={styles.detail_list}>
        <div className={styles.row}>
          <span className={styles.label}>Descripción</span>
          <span className={styles.value}>{alert.description || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Prioridad</span>
          <span className={priorityClass}>{alert.priority || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Dirección</span>
          <span className={styles.value}>{alert.street || alert.address || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Barrio</span>
          <span className={styles.value}>{alert.neighborhood || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Ciudad</span>
          <span className={styles.value}>{alert.city || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>País</span>
          <span className={styles.value}>{alert.country || "-"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Coordenadas</span>
          <span className={styles.value}>
            {alert.coordinates
              ? `${alert.coordinates.lat}, ${alert.coordinates.lng}`
              : "-"}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Creada</span>
          <span className={styles.value}>
            {alert.createdAt
              ? new Date(alert.createdAt).toLocaleString()
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminReadOnly;

