import styles from "./desktopOnly.module.css"

export default function DesktopOnly() {
  return (
    <div>
      <div className={styles.title}>
        <span className={styles.char}>E</span>
        <span className={styles.char}>T </span>
        <span className={styles.char}>H </span>
        <svg style={{ fontSize: 70 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em" role="img" aria-label="Maze icon">
          <g
            fill="none"
            stroke="yellowgreen"
            strokeWidth={7}
            strokeLinecap="butt"
          >
            <circle cx="50" cy="50" r="36" strokeDasharray="50 4" strokeDashoffset="5" />
            <circle cx="50" cy="50" r="24" strokeDasharray="30 4" strokeDashoffset="11" />
            <circle cx="50" cy="50" r="12" strokeDasharray="15 4" strokeDashoffset="19" />
          </g>
        </svg>
        <span className={styles.char}>S</span>
      </div>
      <div style={{ padding: 40 }}>
        This app is desktop only. Please use a laptop or desktop.
      </div>
    </div>
  )
}
