import LogoutButton from "./LogoutButton";
import styles from "./header.module.css"

export default function Header() {

  return (
    <div>
      <div className={styles.header}>
         <div className={styles.left}>
        <span>E T H O S</span>
      </div>

      <div className={styles.right}>
        <LogoutButton />
      </div>
      </div>
    </div>
  )
}