import React from 'react';
import './App.css';
import Header from './components/Header';  
import Footer from './components/Footer';  
import MainPage from './pages/MainPage/MainPage'; 
import LoginPage from './pages/LoginPage/Loginpage';
import {  Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login'; // 현재 경로가 로그인 페이지인지 확인


  return (
    <div className="App">
      {!isLoginPage && <Header />}
        <Routes>
          {/* 메인페이지 */}
          <Route path="/" element={<MainPage />} />
          {/* 로그인페이지 */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      {!isLoginPage && <Footer />}
    </div>  

  );
}

export default App;