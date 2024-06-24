import React, { useState, useEffect, useRef } from 'react';
import Input from './Input';
import { useSocket } from './hooks/useSocket';
import Sidebar from './Sidebar/Sidebar';
import { socket } from '../SocketConnection';
import SocketConnection from '../SocketConnection';
import { useLocation } from 'react-router-dom';

const Main = () => {
  

  return (
    <div id="container">
      <div style={{width: '75vw'}}></div>
      <Sidebar />

    </div>
  )
};

export default Main;