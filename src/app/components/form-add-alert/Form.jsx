"use client";

import React, { useState, useEffect } from "react";
import { alertTypeOptions, getDescriptionsForType } from "../../data/alertType";
import { level as levelOptions } from "../../data/alertLevel";
import styles from "./page.module.css";
import { ScrollShadow } from "@heroui/react";
import { createAlert } from "../../../service/alerts";
import Spinner from "../../components/spinner/Spinner";
import { Toast } from "../../../utils/toast";
import { useRouter } from "next/navigation";

const Form = ({ onAlertCreated }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [otherText, setOtherText] = useState("");
  const [priority, setPriority] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setDescription("");
    setOtherText("");
  }, [category]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      Toast.fire({
        icon: "info",
        title: "Tu navegador no soporta geolocalización.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAddress(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
      },
      (err) => {
        console.warn("No se pudo obtener geolocalización:", err.message);
        Toast.fire({
          icon: "error",
          title: "No se pudo obtener datos de ubicación. Intenta de nuevo.",
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalDescription = description === "Otro" ? otherText : description;

      const payload = {};
      if (coords?.lat && coords?.lng) {
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      } else if (address) {
        payload.address = address;
      }

      const geocodeRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!geocodeRes.ok) {
        console.error("Geocoding error", await geocodeRes.text());
        Toast.fire({
          icon: "error",
          title: "No se pudo obtener datos de ubicación. Intenta de nuevo.",
        });
        return;
      }

      const geo = await geocodeRes.json();

      if ((!geo.lat || !geo.lng) && !geo.formattedAddress) {
        Toast.fire({
          icon: "error",
          title: "No se pudo obtener datos de ubicación. Intenta de nuevo.",
        });
        return;
      }

      const finalCoords =
        geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : coords;
      const finalAddress = geo.formattedAddress || address;

      const alertObj = {
        category: category || null,
        description: finalDescription || null,
        priority,
        address: finalAddress || null,
        street: geo.street || null,
        neighborhood: geo.neighborhood || null,
        city: geo.city || null,
        department: geo.department || null,
        country: geo.country || null,
        postalCode: geo.postalCode || null,
        placeId: geo.placeId || null,
        coordinates: finalCoords || null,
        createdAt: new Date().toISOString(),
      };

      const newId = await createAlert(alertObj);

      Toast.fire({
        icon: "success",
        title: "Alerta creada exitosamente.",
      });

      router.push(`/detail/${newId}`);

      if (onAlertCreated) {
        onAlertCreated({ id: newId, ...alertObj });
      }

      setCategory("");
      setDescription("");
      setOtherText("");
      setPriority("");
      setAddress("");
      setCoords(null);
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: "error",
        title: "No se pudo obtener datos de ubicación. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollShadow className={styles.scrollShadow}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Categoría */}
        <div className={styles.form_group}>
          <label htmlFor="category">Categoría *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
          <label htmlFor="description">Descripción *</label>
          <select
            id="description"
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
          </select>
        </div>

        {description === "Otro" && (
          <div className={styles.form_group}>
            <label htmlFor="other">Especificar *</label>
            <input
              id="other"
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Describe brevemente"
              required
            />
          </div>
        )}

        {/* Nivel de prioridad */}
        <div className={styles.form_group}>
          <label htmlFor="priority">Nivel de prioridad *</label>
          <select
            id="priority"
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

        {/* Dirección */}
        <div className={styles.form_group}>
          <label htmlFor="address">Dirección *</label>
          <div className={styles.address_group}>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle 123 #45-67"
              required
            />
            <span className={styles.location_link} onClick={useCurrentLocation}>
              Usar ubicación actual
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.form_actions}>
          <button
            type="submit"
            className={`${styles.submit_btn} ${loading ? styles.loading : ""}`}
            disabled={loading}
          >
            {loading ? <Spinner size="1.5em" /> : "Enviar alerta"}
          </button>
        </div>
      </form>
    </ScrollShadow>
  );
};

export default Form;
