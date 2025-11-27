"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import styles from "./ChatTypingArea.module.css"

type ChatTypingAreaProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: number; // max px height for the textarea before it scrolls
};

export default function ChatTypingArea({
  onSend,
  disabled = false,
  placeholder = "Send a message...",
  maxHeight = 200,
}: ChatTypingAreaProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto"; // reset
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const sendMessage = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={styles.textarea}
            style={{ maxHeight }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={disabled || !value.trim()}
            className={styles.sendButton}
          >
            Send
          </button>
        </div>

        
      </div>
    </div>
  );
}
