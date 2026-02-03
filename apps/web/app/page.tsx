import styles from "./page.module.css"
import { getSessionFromNextRequest, SessionData, SessionUser } from "../lib/session";
import AuthWrapper from "./components/AuthWrapper";
import Logo from "./components/Logo";

export type AuthedSession =
  SessionData & {
    user: SessionUser
  }

export default async function Canvas() {
  const session: SessionData | AuthedSession | undefined = await getSessionFromNextRequest();
  return (
    <main className={styles.wrapper}>
      <svg className={styles.circle} viewBox="0 0 100 100">
        <g className={styles.ringCW}><circle cx="50" cy="50" r="48" /></g>
        <g className={styles.ringCCW}><circle cx="50" cy="50" r="40" /></g>
        <g className={styles.ringCW}><circle cx="50" cy="50" r="32" /></g>
        <g className={styles.ringCCW}><circle cx="50" cy="50" r="24" /></g>
        <g className={styles.ringCW}><circle cx="50" cy="50" r="16" /></g>
        <g className={styles.ringCCW}><circle cx="50" cy="50" r="8" /></g>
      </svg>
      <div className={styles.cmd}>
        <Logo />
        <AuthWrapper session={session} />
      </div>

 



    </main>


  )
}