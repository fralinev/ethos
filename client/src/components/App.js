import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Entry from './Entry/Entry';
import Main from './Main';
import './style.css'


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Entry setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/main" element={isAuthenticated ? <Main /> : <Navigate to='/' />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;