import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider, AuthContext } from './components/AuthProvider';
import { getAuth } from 'firebase/auth';
import { Row, Col } from "react-bootstrap";

function Layout() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]); 

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login'); 
  };

  return (
    <div className="App bg-dark text-light min-vh-100">
      <Row>
        <Col md={2}>
          {currentUser && <SideBar handleLogout={handleLogout}/>}
        </Col>
        <Col md={10}>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile/:uid" element={<EditProfilePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        </Col>
      </Row>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  );
}

