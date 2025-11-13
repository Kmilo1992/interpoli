"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { ScrollShadow } from "@heroui/react";
import Spinner from "../../components/spinner/Spinner";
import { Toast } from "../../../utils/toast";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../service/firebase";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { setSession } from "../../../utils/session";

const Form = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const typedLooksLikeEmail = /@/.test(user);

      if (typedLooksLikeEmail) {
        // Flujo con Firebase Auth (email/password)
        const cred = await signInWithEmailAndPassword(auth, user, pass);
        const u = cred.user;
        let isAdmin = false;
        try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() || {}) : {};
        if (data.isAdmin === true) {
          isAdmin = true;
        }
        setSession({
          uid: u.uid,
          username: u.email || "",
          isAdmin,
          name: data.name || "",
          ID: data.ID || "",
        });
        } catch (e) {
          console.error("No se pudo leer el rol del usuario:", e);
        }

        Toast.fire({ icon: "success", title: "Inicio de sesión exitoso" });
        router.push(isAdmin ? "/admin" : "/account");
      } else {
        // Flujo con Firestore (username/password) como en tu screenshot
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", user), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data() || {};
          if (String(data.password) === String(pass)) {
            const isAdmin = data.isAdmin === true;
            setSession({
              uid: docSnap.id,
              username: data.username,
              isAdmin,
              name: data.name || "",
              ID: data.ID || "",
            });
            Toast.fire({ icon: "success", title: "Inicio de sesión exitoso" });
            router.push(isAdmin ? "/admin" : "/account");
            return;
          }
        }
        throw new Error("INVALID_CREDENTIALS");
      }
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: "error",
        title: "Usuario o contraseña incorrectos.",
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
            placeholder="Ingresa tu usuario o email"
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
