"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { ScrollShadow } from "@heroui/react";
import { Toast } from "../../../utils/toast";
import { useRouter } from "next/navigation";
import { collection, addDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../../../service/firebase";
import Spinner from "../../components/spinner/Spinner";
import { setSession } from "../../../utils/session";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const leftPad = (num, size = 6) => String(num).padStart(size, "0");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Referencia a usuarios
      const usersRef = collection(db, "users");
      // Validación de username único
      const existsQ = query(usersRef, where("username", "==", username.trim()), limit(1));
      const existsSnap = await getDocs(existsQ);
      if (!existsSnap.empty) {
        Toast.fire({ icon: "error", title: "El usuario ya existe" });
        setLoading(false);
        return;
      }

      // Obtener último ID
      const q = query(usersRef, orderBy("ID", "desc"), limit(1));
      const snap = await getDocs(q);
      let next = 1;
      if (!snap.empty) {
        const data = snap.docs[0].data() || {};
        const current = parseInt(String(data.ID || "0").replace(/\D/g, ""), 10) || 0;
        next = current + 1;
      }
      const nextId = leftPad(next, 6);

      // Crear usuario
      const payload = {
        name: name.trim(),
        username: username.trim(),
        password: password,
        isAdmin: false,
        ID: nextId,
        createdAt: new Date().toISOString(),
      };

      if (!payload.name || !payload.username || !payload.password) {
        Toast.fire({ icon: "error", title: "Completa todos los campos" });
        setLoading(false);
        return;
      }

      // Validación simple de username
      if (/\s/.test(payload.username)) {
        Toast.fire({ icon: "error", title: "El usuario no debe tener espacios" });
        setLoading(false);
        return;
      }

      const docRef = await addDoc(usersRef, payload);

      // Iniciar sesión local automáticamente
      setSession({ uid: docRef.id, username: payload.username, name: payload.name, ID: payload.ID, isAdmin: false });

      Toast.fire({ icon: "success", title: "Cuenta creada" });
      router.push("/account");
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "No se pudo crear la cuenta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollShadow className={styles.scrollShadow}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Crear cuenta</h2>
        <p className={styles.subtitle}>Ingresa tus datos para registrarte</p>

        <div className={styles.form_group}>
          <label htmlFor="name">Nombre *</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="username">Usuario *</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="p. ej. juan123" required />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="password">Contraseña *</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        <div className={styles.form_actions}>
          <button type="submit" className={`${styles.submit_btn} ${loading ? styles.loading : ""}`} disabled={loading}>
            {loading ? <Spinner size="1.5em" /> : "Crear cuenta"}
          </button>
        </div>
      </form>
    </ScrollShadow>
  );
};

export default SignupPage;
