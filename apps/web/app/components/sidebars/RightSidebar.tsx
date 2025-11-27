"use client"
import { useEffect, useState } from "react"
import styles from "./RightSidebar.module.css"
import { useSocket } from "@/apps/web/hooks/useSocket"
import WsTestPage from "../../test/page"
import Logger from "../Logger"
import HealthCheck from "../HealthChecks"



export default function RightSidebar({ initialHealth }: { initialHealth: any }) {
  

  const debounce = (fn: any, delay: number) => {
    let timeout: NodeJS.Timeout | undefined;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        fn(...args)
      }, delay);
    }
  }

  const logger = debounce((num: number, num2: number) => {
    console.log(`#${num} and #${num2}`)
  }, 3000)


  const throttle = (fn: any, delay: number) => {
    let called: boolean = false;
    return (...args: any[]) => {
      if (!called) {
        called = true
        fn(...args)
        setTimeout(() => { called = false }, delay)
      }
    }
  }

  const click = throttle(() => {
    console.log("throttle")
  }, 3000)

  return (
    <div className={styles.rightSidebarContentContainer}>
      <div className={styles.healthCheck}>
        <HealthCheck />
      </div>

      <div className={styles.logger}>
        <Logger />
      </div>
    </div>
  )
}