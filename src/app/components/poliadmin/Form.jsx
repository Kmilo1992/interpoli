"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { ScrollShadow } from "@heroui/react";
import Spinner from "../../components/spinner/Spinner";
import { Toast } from "../../../utils/toast";
import { useRouter } from "next/navigation";
import { db } from "../../../service/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Form = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("username", "==", user));
      const snap = await getDocs(q);

      if (snap.empty) {
        Toast.fire({ icon: "error", title: "Usuario no encontrado" });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();

      //  Comparar contraseña
      if (userData.password !== pass) {
        Toast.fire({ icon: "error", title: "Contraseña incorrecta" });
        setLoading(false);
        return;
      }

      // Crear cookie de sesión
      document.cookie = "session=true; path=/; max-age=900; SameSite=Lax";


      Toast.fire({ icon: "success", title: "Inicio de sesión exitoso" });
      router.push("/admin");

    } catch (error) {
      console.error(error);
      Toast.fire({ icon: "error", title: "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollShadow className={styles.scrollShadow}>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.form_group}>
          <label htmlFor="user">Usuario *</label>
          <input
            id="user"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Nombre de usuario"
            required
          />
        </div>

        <div className={styles.form_group}>
          <label htmlFor="pass">Contraseña *</label>
          <input
            id="pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Contraseña"
            required
          />
        </div>

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
