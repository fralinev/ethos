import styles from "./page.module.css"
import { getSessionFromNextRequest } from "../lib/session";
import AuthWrapper from "./AuthComponents/AuthWrapper";
import Logo from "./home/components/Logo";
import type { SessionData, AuthedSession} from "@ethos/shared"



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
        <Logo fontSize={70} svgSize={70} color="yellowgreen"/>
        <AuthWrapper session={session} />
      </div>

 



    </main>


  )
}