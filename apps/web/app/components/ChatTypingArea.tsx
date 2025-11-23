"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";

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
    <div
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "12px 16px",
        background: "rgba(53, 40, 40, 0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            padding: "8px 12px",
            background: "#48545fff",
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              lineHeight: 1.5,
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "2px",   // optional, for aesthetics
              paddingRight: "2px",
              maxHeight,
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={disabled || !value.trim()}
            style={{
              borderRadius: "999px",
              border: "none",
              padding: "6px 12px",
              fontSize: 14,
              cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
              opacity: disabled || !value.trim() ? 0.5 : 1,
              background: "#10a37f",
              color: "white",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(0,0,0,0.45)",
            marginTop: 6,
            textAlign: "center",
          }}
        >
          Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
        </div>
      </div>
    </div>
  );
}
