"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, Button } from "@heroui/react";
import styles from "./page.module.css";
import { usePathname, useRouter } from "next/navigation";
import Reference from "../../../assets/icons/reference.svg";
import Earth from "../../../assets/icons/earth.svg";
import MageFilter from "../../../assets/icons/mage-filter.svg";
import Image from "next/image";
import infoIcon from "../../../assets/icons/info.png";
import logoAnglo from "../../../assets/icons/logo_anglo.png";
import Logo from "../../../assets/icons/logo.png";
import Police from "../../../assets/icons/police.svg";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../service/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getSession } from "../../../utils/session";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);
  const [authLabel, setAuthLabel] = useState("Iniciar Sesión");
  const [authPath, setAuthPath] = useState("/poliadmin");
  const [isAdmin, setIsAdmin] = useState(false);

  const basePlacement = [
    { id: 1, icon: Reference, name: "Alerts", path: "/alerts" },
    { id: 2, icon: Earth, name: "Map", path: "/" },
    { id: 3, icon: MageFilter, name: "Report", path: "/add-alert" },
  ];

  // Auth/session state for label and destination path
  useEffect(() => {
    const applyFromSession = () => {
      try {
        const s = getSession();
        if (s && typeof s.isAdmin === "boolean") {
          setIsAdmin(s.isAdmin);
          setAuthLabel(s.isAdmin ? "Admin" : "User");
          // El botón de cuenta siempre lleva al perfil
          setAuthPath("/account");
          return true;
        }
      } catch {}
      return false;
    };

    const updateFromAuthUser = async (user) => {
      if (!user) {
        setIsAdmin(false);
        setAuthLabel("Iniciar Sesión");
        setAuthPath("/poliadmin");
        return;
      }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const roleAdmin = !!(snap.exists() && snap.data()?.isAdmin === true);
        setIsAdmin(roleAdmin);
        setAuthLabel(roleAdmin ? "Admin" : "User");
        setAuthPath("/account");
      } catch (e) {
        console.error("Error leyendo rol de usuario:", e);
        setIsAdmin(false);
        setAuthLabel("Iniciar Sesión");
        setAuthPath("/poliadmin");
      }
    };

    const refreshNow = () => {
      // 1) intenta con sesión local
      if (applyFromSession()) return;
      // 2) intenta con auth actual
      const u = auth?.currentUser || null;
      if (u) {
        updateFromAuthUser(u);
      } else {
        // 3) invitado
        setIsAdmin(false);
        setAuthLabel("Iniciar Sesión");
        setAuthPath("/poliadmin");
      }
    };

    // Try from local session first
    refreshNow();

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // If session exists, it will override
      if (applyFromSession()) return;
      updateFromAuthUser(user);
    });

    const onSessionChanged = () => {
      const has = applyFromSession();
      if (!has) {
        // Forzar modo invitado inmediatamente al limpiar la sesión
        setIsAdmin(false);
        setAuthLabel("Iniciar Sesión");
        setAuthPath("/poliadmin");
      }
    };
    window.addEventListener("session-changed", onSessionChanged);
    window.addEventListener("storage", onSessionChanged);

    return () => {
      unsubAuth();
      window.removeEventListener("session-changed", onSessionChanged);
      window.removeEventListener("storage", onSessionChanged);
    };
  }, []);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // close info popover on outside click or ESC
  useEffect(() => {
    if (!showInfo) return;
    const onDown = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setShowInfo(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowInfo(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [showInfo]);

  const handleNavigation = (path) => {
    if (pathname === path) {
      router.push("/"); 
    } else {
      router.push(path); 
    }
  };

  const authItem = { id: "auth", icon: Police, name: authLabel, path: authPath };
  const itemsToShow = isMobile
    ? [...basePlacement, authItem]
    : basePlacement.filter((item) => item.name !== "Map");

  return (
    <section className={styles.sidebar_section}>
      <article className={styles.sidebar_article_header}>
        <Button className={styles.sidebar_logo} as={Link} href={"/"}>
          <Image 
            src={Logo} 
            alt="Logo" 
            className={styles.logo} 
            width={120} 
            height={40} 
            priority 
          />
        </Button>
      </article>
      <hr aria-orientation="horizontal" className={styles.hr_line} />
      <article className={styles.sidebar_article_items}>
        {itemsToShow.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Button
              key={item.id}
              className={`${styles.sidebar_btn} ${ isActive ? styles.active : "" }`}
              onPress={() => handleNavigation(item.path)}
            >
              <item.icon className={styles.icons} />
              <p className={styles.text_name_btn}>{item.name}</p>
            </Button>
          );
        })}
        {isMobile && (
          <div
            className={styles.info_wrap}
            ref={infoRef}
          >
            <div
              className={`${styles.info_trigger} ${styles.sidebar_btn}`}
              role="button"
              tabIndex={0}
              onClick={() => setShowInfo((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowInfo((v) => !v);
              }}
              aria-label="Información de la aplicación"
              aria-expanded={showInfo}
            >
              <Image src={infoIcon} alt="Info" className={styles.info_icon} />
              <span className={styles.text_name_btn}>Info</span>
            </div>
            <div
              className={`${styles.info_popover} ${styles.mobile} ${showInfo ? styles.open : ""}`}
              role="dialog"
              aria-label="Información"
            >
              <Image src={logoAnglo} alt="Logo Anglo" className={styles.info_brand} />
              <p className={`${styles.info_text} ${styles.info_version}`}>Versión: v0.0.2 (Beta)</p>
              <p className={styles.info_text}>Creado por:</p>
              <p className={styles.info_text}>Colegio Anglo Americano:</p>
              <p className={styles.info_text}>&emsp;Jerónimo Clavijo</p>
              <p className={styles.info_text}>&emsp;Santiago Hernández</p>
              <p className={styles.info_text}>&emsp;Paula Solano</p>
              <p className={styles.info_text}>&emsp;Mariana Castro</p>
              <p className={styles.info_text}>&emsp;Nicolás Rojas</p>
              <p className={styles.info_text}>&emsp;Juan Camilo Luis Gonzalez</p>
            </div>
          </div>
        )}
      </article>
      {!isMobile && (
        <div className={styles.sidebar_article_footer}>
          {/* Auth/Admin button above Info on desktop */}
          <Button
            className={styles.sidebar_btn}
            onPress={() => handleNavigation(authItem.path)}
          >
            <authItem.icon className={styles.icons} />
            <p className={styles.text_name_btn}>{authItem.name}</p>
          </Button>

          <div
            className={styles.info_wrap}
            ref={infoRef}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <div
              className={styles.info_trigger}
              role="button"
              tabIndex={0}
              onClick={() => setShowInfo((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowInfo((v) => !v);
              }}
              aria-label="Información de la aplicación"
              aria-expanded={showInfo}
            >
              <Image src={infoIcon} alt="Info" className={styles.info_icon} />
              <span className={styles.text_name_btn}>Info</span>
            </div>
            <div
              className={`${styles.info_popover} ${showInfo ? styles.open : ""}`}
              role="dialog"
              aria-label="Información"
            >
              <Image src={logoAnglo} alt="Logo Anglo" className={styles.info_brand} />
              <p className={`${styles.info_text} ${styles.info_version}`}>Versión: v0.0.2 (Beta)</p>
              <p className={styles.info_text}>Creado por:</p>
              <p className={styles.info_text}>Colegio Anglo Americano:</p>
              <p className={styles.info_text}>&emsp;Jerónimo Clavijo</p>
              <p className={styles.info_text}>&emsp;Santiago Hernández</p>
              <p className={styles.info_text}>&emsp;Paula Solano</p>
              <p className={styles.info_text}>&emsp;Mariana Castro</p>
              <p className={styles.info_text}>&emsp;Nicolás Rojas</p>
              <p className={styles.info_text}>&emsp;Juan Camilo Luis Gonzalez</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sidebar;
