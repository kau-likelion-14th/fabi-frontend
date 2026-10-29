import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectRoute';
import MainPage from './pages/MainPage/MainPage';
import LoginPage from './pages/LoginPage/Loginpage';
import FriendPage from './pages/FriendPage/FriendPage';
import MyPage from './pages/MyPage/MyPage';
import FriendDetailPage from './pages/FriendPage/FriendDetailPage';
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = 
    location.pathname === '/login'||
    location.pathname === '/login/oauth2/code/kakao';

  return (
    <div>
      {!isLoginPage && <Header />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/oauth2/code/kakao" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/friends/:id" element={<FriendDetailPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>

      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;