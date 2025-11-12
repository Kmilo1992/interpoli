"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Form from "../../components/poliadmin/Form";

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
    </div>
  );
};

export default Adminlogin;
