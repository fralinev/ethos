import React, { useRef, useState, useEffect } from 'react';
import './chattypingarea.css';

const ChatTypingArea = ({text, setText, onEnter}) => {
//   const [textareaValue, setTextareaValue] = useState('');
  const textareaRef = useRef(null);
  const hiddenDivRef = useRef(null);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  useEffect(() => {
    if (hiddenDivRef.current) {
      hiddenDivRef.current.dataset.replicatedValue = text + ' ';
      if (textareaRef.current) {
        textareaRef.current.style.height = `${hiddenDivRef.current.scrollHeight}px`;
      }
    }
  }, [text]);

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
    <div className="chat-typing-container">
      <textarea
        id="chat-typing-input"
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={onEnter}
      ></textarea>
      <div
        ref={hiddenDivRef}
        className="hidden-div"
        aria-hidden="true"
      />
    </div>
    </div>
  );
};

export default ChatTypingArea;