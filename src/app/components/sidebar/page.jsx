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

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);

  const placement = [
    { id: 1, icon: Reference, name: "Alerts", path: "/alerts" },
    { id: 2, icon: Earth, name: "Map", path: "/" },
    { id: 3, icon: MageFilter, name: "Report", path: "/add-alert" },
  ];

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

  const itemsToShow = isMobile
    ? placement
    : placement.filter((item) => item.name !== "Map");

  return (
    <section className={styles.sidebar_section}>
      <article className={styles.sidebar_article_header}>
        <Button className={styles.sidebar_logo} as={Link} href={"/"}>
          <Reference className={styles.logo} />
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
              <p className={styles.info_text}>
                Jerónimo Clavijo, Santiago Hernández, Paula Solano, Mariana Castro,
                Nicolás Rojas & Juan Camilo Luis Gonzalez
              </p>
            </div>
          </div>
        )}
      </article>
      {!isMobile && (
        <div className={styles.sidebar_article_footer}>
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
              <p className={styles.info_text}>
                Jerónimo Clavijo, Santiago Hernández, Paula Solano, Mariana Castro,
                Nicolás Rojas & Juan Camilo Luis Gonzalez
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sidebar;
