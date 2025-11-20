import LogoutButton from "./LogoutButton";
import styles from "./header.module.css"
import { getSessionFromNextRequest } from "../../lib/session";

export default async function Header() {
  const session = await getSessionFromNextRequest();

  return (
    <div>
      <div className={styles.header}>
         <div className={styles.left}>
        <span>E T H O S</span>
      </div>

      <div className={styles.right}>
        <LogoutButton session={session}/>
      </div>
      </div>
    </div>
  )
}