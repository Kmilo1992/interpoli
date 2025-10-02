"use client";

import React from "react";
import styles from "./layout.module.css";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Sidebar from "../components/sidebar/page";

const Map = dynamic(() => import("../components/map/page"), { ssr: false });

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isRoot = pathname === "/";

  return (
    <main className={styles.main_container}>
      <div className={styles.section_sidebar}>
        <Sidebar />
      </div>
      <section className={styles.section_content}>
        <div
          className={`${styles.section_panel} ${!isRoot ? styles.open : ""}`}
          aria-hidden={isRoot ? "true" : "false"}
        >
          {children}
        </div>
        <div className={styles.section_map}>
          <Map />
        </div>
      </section>
    </main>
  );
};

export default MainLayout;
