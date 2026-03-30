import React from 'react';
import './App.css';
import Header from './components/Header';  
import Footer from './components/Footer';  
import {  Routes, Route } from "react-router-dom";
import MainPage from './pages/MainPage/MainPage'; 


function App() {
  return (
    <div>
      <Header />
    
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainPage />} />
      </Routes>

      <Footer />
    </div>  

  );
}

export default App;