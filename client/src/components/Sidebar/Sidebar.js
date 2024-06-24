import React, { useState, useRef, useEffect } from "react";
import ChatTypingArea from "../ChatTypingArea/ChatTypingArea";
import './sidebar.css'
import { useLocation } from "react-router-dom";
import SocketConnection from "../../SocketConnection";

const Sidebar = () => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([])
    const [text, setText] = useState('')

    const socket = useRef(null)
    console.log("check text", text)
    const { state: { currentUser } } = useLocation();
    // const location = useLocation();

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default action of adding a newline
            socket.current.sendMessage(text)
            setText(''); // Clear the textarea after pressing Enter
        }
    };

    console.log("online users", onlineUsers)

    useEffect(() => {
        console.log("check messages", messages)
    }, [messages])

    useEffect(() => {
        const addMessage = (jsonMessage) => {
            setMessages(prevMessages => [...prevMessages, jsonMessage]);
        }
        const updateOnlineUsers = (userList) => {
            setOnlineUsers(userList)
        }
        if (currentUser) {
            socket.current = new SocketConnection({ addMessage, updateOnlineUsers })
            socket.current.connect(currentUser)

        }
    }, [currentUser])
    return <div id='sidebar'>
        
        <ChatTypingArea text={text} setText={setText} onEnter={handleKeyDown} />
        {messages.map((message) => {
            console.log("message: ", message)
            if (message.user === currentUser) {
                return <div style={{textAlign: 'right', color: 'yellow'}}>{message.body}</div>
            } else {
                return <div>{message.body}</div>
            }
            
        })}
    </div>


}

export default Sidebar