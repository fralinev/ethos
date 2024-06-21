import React, { useState, useEffect, useRef } from 'react';
import Input from './Input';
import { useSocket } from './hooks/useSocket';
import Sidebar from './Sidebar';
import { socket } from '../SocketConnection';
import SocketConnection from '../SocketConnection';

const Main = () => {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [userList, setUserList] = useState([])

  const [userInput, setUserInput] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const socket = useRef(null)

  useEffect(() => {
    const addMessage = (jsonMessage) => {
      setMessages(prevMessages => [...prevMessages, jsonMessage]);
    }
    const updateUserList = (userList) => {
      setUserList(userList)
    }
     socket.current = new SocketConnection({addMessage, updateUserList})
  }, [])

  // const { sendMessage } = useSocket(setMessages);

  const messagesToDisplay = messages.map((message, index) => {
    if (currentUser === message.user) {
      return <div style={{ color: 'yellow', textAlign: 'right' }}>{message.body}</div>
    } else {
      return <div style={{ color: 'yellow' }}>{message.body}</div>
    }
  })

  return (
    <div id="container">
      <div style={{flex: 3}}>
        <input type='text'
          onChange={(e) => setUserInput(e.target.value)}
          placeholder='Set user...'
          value={userInput}


        />
        <button disabled={currentUser} onClick={() => {
          setCurrentUser(userInput);
          socket.current.connect(userInput)   
          setUserInput('')
          
        }}>Set User</button>
        <input
          type='text'
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={() => {
          socket.current.sendMessage(body);
          setBody('')
        }}>Send</button>
        {currentUser && <span style={{ color: 'yellow' }}>{currentUser}</span>}
        <button onClick={
          () => {
            socket.current.close();
          }
        }>disconnect</button>
        {messagesToDisplay}
      </div>
      <Sidebar users={userList} />

    </div>
  )
};

export default Main;