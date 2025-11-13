"use client";

import React from "react";
import styles from "./page.module.css";
import Form from "../../components/poliadmin/Form";
import Link from "next/link";

const Adminlogin = () => {
  return (
    <div className={styles.report_container}>
      <div className={styles.title_container}>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.subtitle}>
          Ingresa los datos solicitados para iniciar sesión
        </p>
      </div>
      <Form />
      <div style={{ padding: "0.6rem 1rem" }}>
        <p style={{ margin: 0, color: "var(--color-zinc-700)" }}>¿No tienes cuenta?</p>
        <Link href="/signup" style={{ color: "#2563eb", fontWeight: 700 }}>Crear cuenta</Link>
      </div>
    </div>
  );
};

export default Adminlogin;
