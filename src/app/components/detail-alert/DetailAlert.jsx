"use client";

import React from "react";
import styles from "./page.module.css";
import { alertImages } from "../../../utils/alertImages";

const DetailAlert = ({ alert }) => {
  const imageSrc =
    alert.mapImage ||
    alertImages[alert.category?.toLowerCase()] ||
    "/images/alerts/otro.jpg";

  return (
    <div className={styles.detail_container}>
      {/* Imagen superior */}
      <div className={styles.image_wrapper}>
        <img
          src={imageSrc}
          alt={alert.category || "Alerta"}
          className={styles.image}
        />
      </div>

      {/* Encabezado */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {alert.category
            ? alert.category.charAt(0).toUpperCase() + alert.category.slice(1)
            : "Alerta"}
        </h1>
        <p className={styles.description}>{alert.description}</p>
      </div>

      {/* Lista de detalles */}
      <div className={styles.detail_list}>
        <div className={styles.row}>
          <span className={styles.label}>Dirección</span>
          <span className={styles.value}>{alert.address || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Calle</span>
          <span className={styles.value}>{alert.street || "-"}</span>
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
          <span className={styles.label}>Departamento</span>
          <span className={styles.value}>{alert.department || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>País</span>
          <span className={styles.value}>{alert.country || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Prioridad</span>
          <span
            className={`${styles.value} ${styles.priority} ${
              styles[alert.priority?.toLowerCase()]
            }`}
          >
            {alert.priority || "-"}
          </span>
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

export default DetailAlert;
