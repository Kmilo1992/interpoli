"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { ScrollShadow } from "@heroui/react";
import Spinner from "../../components/spinner/Spinner";
import { Toast } from "../../../utils/toast";
import { useRouter } from "next/navigation";

const Form = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user === "admin" && pass === "1234") {
        Toast.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
        });

        router.push("/admin");
      } else {
        Toast.fire({
          icon: "error",
          title: "Usuario o contraseña incorrectos",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: "error",
        title: "Ocurrió un error. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollShadow className={styles.scrollShadow}>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Usuario */}
        <div className={styles.form_group}>
          <label htmlFor="user">Usuario *</label>
          <input
            id="user"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        {/* Contraseña */}
        <div className={styles.form_group}>
          <label htmlFor="pass">Contraseña *</label>
          <input
            id="pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        {/* Submit */}
        <div className={styles.form_actions}>
          <button
            type="submit"
            className={`${styles.submit_btn} ${loading ? styles.loading : ""}`}
            disabled={loading}
          >
            {loading ? <Spinner size="1.5em" /> : "Ingresar"}
          </button>
        </div>

      </form>
    </ScrollShadow>
  );
};

export default Form;
