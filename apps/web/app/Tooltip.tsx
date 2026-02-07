// Tooltip.tsx
"use client";
import styles from "./Tooltip.module.css";

type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

export default function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className={styles.tooltip}>
      {children}
      <span className={styles.tooltipText} role="tooltip">
        {text}
      </span>
    </span>
  );
}
