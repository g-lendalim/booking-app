import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

export default function SideBar({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className="p-3">
      {/* Sidebar Header */}
      <div className="text-center mb-4 mt-3">
        <i className="bi bi-heart-pulse text-danger" style={{ fontSize: '2.5rem' }}></i>
        <h4 className="mt-2 fs-5 fw-bold">Lifeline Medical Center</h4>
      </div>

      {/* Navigation Links */}
      <Nav className="flex-column">
        <Nav.Link
          onClick={() => navigate('/dashboard')}
          className="nav-link"
        >
          <i className="bi bi-speedometer" /> Dashboard
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate('/appointments')}
          className="nav-link"
        >
          <i className="bi bi-house" /> Appointments
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate('/profile')}
          className="nav-link"
        >
          <i className="bi bi-person" /> Profile
        </Nav.Link>
        <Nav.Link
          onClick={handleLogout}
          className="nav-link"
        >
          <i className="bi bi-box-arrow-right" /> Log Out
        </Nav.Link>
      </Nav>
    </div>
  );
}
