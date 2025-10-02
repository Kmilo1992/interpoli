"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Form from "../../components/form-add-alert/Form";

const AddAlert = () => {
  return (
    <div className={styles.report_container}>
      <div className={styles.title_container}>
        <h2 className={styles.title}>Reportar nueva alerta</h2>
        <p className={styles.subtitle}>
          Ingresa los datos solicitados para reportar una situación y alertar a la comunidad
        </p>
      </div>
      <Form />
    </div>
  );
};

export default AddAlert;
