"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { alertImages } from "../../../utils/alertImages";
import { alertTypeOptions, getDescriptionsForType } from "../../data/alertType";
import { level as levelOptions } from "../../data/alertLevel";
import { Toast } from "../../../utils/toast";

const AdminDetail = ({ alert, onUpdate, onDelete }) => {
  const [category, setCategory] = useState(alert.category || "");
  const [description, setDescription] = useState(alert.description || "");
  const [otherText, setOtherText] = useState("");
  const [priority, setPriority] = useState(alert.priority || "");

  // Detectar cuando era un texto personalizado
  useEffect(() => {
    if (
      alert.description &&
      !getDescriptionsForType(alert.category).includes(alert.description)
    ) {
      setDescription("Otro");
      setOtherText(alert.description);
    }
  }, []);

  const handleSave = () => {
    const finalDescription = description === "Otro" ? otherText : description;

    if (!category || !finalDescription || !priority) {
      Toast.fire({
        icon: "error",
        title: "Todos los campos obligatorios deben estar completos.",
      });
      return;
    }

    const updatedAlert = {
      ...alert,
      category,
      description: finalDescription,
      priority,
    };

    if (onUpdate) onUpdate(updatedAlert);

    Toast.fire({
      icon: "success",
      title: "Cambios guardados.",
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Seguro deseas eliminar esta alerta?")) return;

    if (onDelete) onDelete(alert.id);
  };

  const imageSrc =
    alert.mapImage ||
    alertImages[alert.category?.toLowerCase()] ||
    "/images/alerts/otro.jpg";

  return (
    <div className={styles.detail_container}>
      {/* Imagen superior */}
      <div className={styles.image_wrapper}>
        <img src={imageSrc} alt={alert.category} className={styles.image} />
      </div>

      {/* Título */}
      <div className={styles.header}>
        <h1 className={styles.title}>Editar Alerta</h1>
      </div>

      {/* FORM EXACTO DEL FORMULARIO ORIGINAL */}
      <div className={styles.form}>
        {/* Categoría */}
        <div className={styles.form_group}>
          <label>Categoría *</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setDescription("");
              setOtherText("");
            }}
            required
          >
            <option value="" disabled hidden>
              Selecciona categoría
            </option>
            {alertTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className={styles.form_group}>
          <label>Descripción *</label>
          <select
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!category}
            required
          >
            <option value="" disabled hidden>
              {category ? "Selecciona descripción" : "Primero elige categoría"}
            </option>

            {getDescriptionsForType(category).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}

            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Input Otro */}
        {description === "Otro" && (
          <div className={styles.form_group}>
            <label>Especificar *</label>
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Describe brevemente"
              required
            />
          </div>
        )}

        {/* Prioridad */}
        <div className={styles.form_group}>
          <label>Nivel de prioridad *</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="" disabled hidden>
              Selecciona una opción
            </option>
            {levelOptions.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className={styles.form_actions}>
          <button className={styles.submit_btn} onClick={handleSave}>
            Guardar cambios
          </button>

          <button
            className={styles.submit_btn}
            onClick={handleDelete}
            style={{
              background: "#c62828",
              color: "white",
              marginTop: "0.6rem",
            }}
          >
            Eliminar alerta
          </button>
        </div>
      </div>

      {/* INFORMACIÓN NO EDITABLE */}
      <div className={styles.detail_list}>
        <div className={styles.row}>
          <span className={styles.label}>Dirección</span>
          <span className={styles.value}>{alert.address || "-"}</span>
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

export default AdminDetail;
