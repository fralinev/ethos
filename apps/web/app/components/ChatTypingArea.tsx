"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import styles from "./ChatTypingArea.module.css"
import { throttle } from "../../lib/utils";
import { useSocket } from "../../hooks/useSocket";

type ChatTypingAreaProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: number;
};

export default function ChatTypingArea({
  onSend,
  disabled = false,
  placeholder = "Send a message...",
  maxHeight = 200,
}: ChatTypingAreaProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {client} = useSocket();

  const sendTypingIndicator = useRef(
    throttle(() => {
      console.log("sending typing indicator");
      client.send({type: "chat:typing"})
    }, 3000)
  ).current;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    sendTypingIndicator();
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
