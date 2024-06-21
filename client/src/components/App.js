import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Entry from './Entry';
import Main from './Main';
import './style.css'


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/main" element={<Main />} />
        </Routes>
      </Router>
      {/* <Entry /> */}
    </>
  );
}

export default App;