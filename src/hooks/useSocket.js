import { useEffect, useRef } from 'react'

export const useSocket = (setMessages) => {
    const socket = useRef(null);
    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:8080');
        socket.current.onopen = () => {
            console.log('WebSocket connection established');
        };
        socket.current.onmessage = async (event) => {
            const stringMessage = await event.data.text();
            const jsonMessage = JSON.parse(stringMessage)
            setMessages(prevMessages => [...prevMessages, jsonMessage]);
        };
        socket.current.onclose = () => {
            console.log('WebSocket connection closed');
        };
        return () => {
            socket.current.close();
        };
    }, []);

    const sendMessage = (input, currentUser) => {
        if (socket.current && input) {
            const jsonMessage = {
                username: currentUser,
                body: input,
                dateSent: new Date().toISOString()
            }
                socket.current.send(JSON.stringify(jsonMessage));
        }
    };

    return { sendMessage }
}