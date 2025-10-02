"use client"

import React from "react"
import styles from "./page.module.css"

const Spinner = ({ size = "3em" }) => {
  return (
    <div className={styles.panel}>
      <div
        className={styles.spinner}
        style={{ width: size, height: size }}
      ></div>
    </div>
  )
}

export default Spinner
