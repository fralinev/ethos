import styles from "./Spinner.module.css";

type SpinnerProps = {
  size?: number;
};

export default function Spinner({ size = 24 }: SpinnerProps) {
  const borderWidth = Math.max(2, Math.round(size / 8));

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.spinner}
        role="status"
        aria-label="Loading"
        style={{
          width: size,
          height: size,
          borderWidth,
        }}
      ></div>
    </div>
  );
}