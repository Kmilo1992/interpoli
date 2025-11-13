"use client";

import React from "react";
import styles from "./page.module.css";
import { timeAgo } from "../../../utils/timeAgo";
import { useRouter } from "next/navigation";
import { alertImages } from "../../../utils/alertImages";

const CardAlert = ({ alert }) => {
  const router = useRouter();

  const {
    id,
    description,
    category,
    priority,
    street,
    neighborhood,
    country,
    city,
    createdAt,
    mapImage,
  } = alert;

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/detail/${alert.id}`);
    window.dispatchEvent(
      new CustomEvent("alert-selected", { detail: alert.id })
    );
  };

  const levelClass =
    priority === "Alta"
      ? styles.high
      : priority === "Media"
      ? styles.medium
      : styles.low;

  // Buscar imagen por categoría
  const alertImage = category ? alertImages[category.toLowerCase()] : null;
  const creator = alert.createdByName || alert.reporterName || alert.createdByUsername || null;

  return (
    <article className={styles.card_link} onClick={handleClick}>
      <article
        className={styles.card_container}
        aria-labelledby={`alert-title-${id}`}
      >
        {/* imagen del mapa o fallback con imagen por categoría */}
        <div className={styles.thumb}>
          {mapImage ? (
            <img src={mapImage} alt="Miniatura de la ubicación" />
          ) : alertImage ? (
            <img src={alertImage} alt={`Imagen de ${category}`} />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              Mapa
            </div>
          )}
        </div>

        {/* contenido principal */}
        <div className={styles.card_body}>
          <h3 id={`alert-title-${id}`} className={styles.title}>
            {category
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : "—"}
          </h3>
          <p className={styles.text_description}>{description}</p>
          <p className={styles.meta}>
            <span className={styles.location}>
              {street || "Ubicación no especificada"}
            </span>
            <span className={styles.location}>
              {neighborhood || "Ubicación no especificada"}
            </span>
          </p>
          {creator && (
            <p className={styles.created_by}>Creada por: {creator}</p>
          )}
        </div>
        <div className={styles.card_info}>
          <div
            className={`${styles.color_bar} ${levelClass}`}
            aria-hidden="true"
          />
          <section className={styles.card_info_body}>
            <p className={styles.text_country}>{country}</p>
            <p className={styles.text_city}>{city}</p>
            <p className={styles.text_time}>{timeAgo(createdAt)}</p>
          </section>
        </div>
      </article>
    </article>
  );
};

export default CardAlert;
