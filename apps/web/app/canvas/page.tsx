import styles from "./canvas.module.css"

export default function Canvas() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.circle}>
        <span className={styles.logo}>ETHOS</span>
        <div className={styles.rays}>
          <div className={`${styles.rayAnchor} ${styles.ray0}`} >
            {/* <button className={styles.btn}>login</button> */}
            <div className={styles.ray}></div>
          </div>
          <div className={`${styles.rayAnchor} ${styles.ray1}`} >
            {/* <button className={styles.btn}>login</button> */}
            <div className={styles.ray}></div>
          </div>
          <div className={`${styles.rayAnchor} ${styles.ray2}`} >
            {/* <button className={styles.btn}>login</button> */}
            <div className={styles.ray}></div>
          </div>
          <div className={`${styles.rayAnchor} ${styles.ray3}`} >
            {/* <button className={styles.btn}>login</button> */}
            <div className={styles.ray}></div>
          </div>
        </div>
      </div>

    </main>
  )
}