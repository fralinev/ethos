"use client"

import { useState, useEffect, useRef } from "react";
import LeftSidebar from "./components/sidebars/LeftSidebar/LeftSidebar";
import styles from "./LayoutShell.module.css"
import MiddleSection from "./MiddleSection/MiddleSection";
import RightSidebar from "./components/sidebars/RightSidebar";

export default function LayoutShell({
  initialChats,
  session,
  activeChatId,
  }: {
    initialChats: any,
    session: any,
    activeChatId: string | undefined,
  }) {

  const DEFAULT_WIDTH = 280;
  const MIN_WIDTH = 220;
  const MAX_WIDTH = 480;

  const [leftWidth, setLeftWidth] = useState<number>(DEFAULT_WIDTH);
  const [rightWidth, setRightWidth] = useState<number>(DEFAULT_WIDTH);

  const dragStateRef = useRef({
    isLeft: false,
    isRight: false,
    startX: 0,
    startLeftWidth: 0,
    startRightWidth: 0
  })

  // useEffect(() => {
  //   const saved = localStorage.getItem("leftSidebarWidth");
  //   if (saved) setLeftWidth(Number(saved));
  // }, []);

  const onPointerDownLeft = (ev: React.PointerEvent) => {
    dragStateRef.current.isLeft = true;
    dragStateRef.current.startX = ev.clientX;
    dragStateRef.current.startLeftWidth = leftWidth;
    ev.currentTarget.setPointerCapture(ev.pointerId)
  }
  const onPointerDownRight = (ev: React.PointerEvent) => {
    dragStateRef.current.isRight = true;
    dragStateRef.current.startX = ev.clientX;
    dragStateRef.current.startRightWidth = rightWidth;
    ev.currentTarget.setPointerCapture(ev.pointerId)
  }

  const onPointerMove = (ev: PointerEvent) => {
    const dx = ev.clientX - dragStateRef.current.startX;
    if (dragStateRef.current.isLeft) {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStateRef.current.startLeftWidth + dx));
      setLeftWidth(newWidth);
    }
    if (dragStateRef.current.isRight) {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStateRef.current.startRightWidth - dx));
      setRightWidth(newWidth);
    }
  }

  const onPointerUp = () => {
    dragStateRef.current.isLeft = false;
    dragStateRef.current.isRight = false;
  }

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [leftWidth, rightWidth]);

  return (
    <>
      <aside className={`${styles.sidebar} ${styles.sidebarLeft}`} style={{ width: `${leftWidth}px` }}>
        <LeftSidebar
          session={session}
          initialChats={initialChats}
          activeChatId={activeChatId} />
        <div
          className={styles.sidebarLeftResizer}
          onPointerDown={onPointerDownLeft}
        />
      </aside>
      <main className={styles.main}>

        <MiddleSection activeChatId={activeChatId}
          session={session}
        />
      </main>
      <aside className={`${styles.sidebar} ${styles.sidebarRight}`} style={{ width: `${rightWidth}px` }}>
        <RightSidebar initialHealth={"OK"} />
        <div
          className={styles.sidebarRightResizer}
          onPointerDown={onPointerDownRight}
        />
      </aside>

    </>
  )

}