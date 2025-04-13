import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

export default function SideBar({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <>
    <div className="p-3">
      <Nav className="flex-column">
        <Nav.Link
          onClick={() => navigate('/dashboard')}
          className="d-flex align-items-center my-2 text-white"
          style={{ fontWeight: '600', fontSize: '20px' }}
          onMouseEnter={(e) => (e.target.style.color = '#007bff')}
          onMouseLeave={(e) => (e.target.style.color = 'white')}
        >
          <i className="bi bi-speedometer me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate('/home')}
          className="d-flex align-items-center mb-2 text-white"
          style={{ fontWeight: '600', fontSize: '20px' }}
          onMouseEnter={(e) => (e.target.style.color = '#007bff')}
          onMouseLeave={(e) => (e.target.style.color = 'white')}
        >
          <i className="bi bi-house me-2 " /> Home
        </Nav.Link>
        <Nav.Link
          onClick={() => navigate('/profile')}
          className="d-flex align-items-center mb-2 text-white"
          style={{ fontWeight: '600', fontSize: '20px' }}
          onMouseEnter={(e) => (e.target.style.color = '#007bff')}
          onMouseLeave={(e) => (e.target.style.color = 'white')}
        >
          <i className="bi bi-person me-2 " /> Profile
        </Nav.Link>
        <Nav.Link
          onClick={handleLogout}
          className="d-flex align-items-center mb-2 text-white"
          style={{ fontWeight: '600', fontSize: '20px' }}
          onMouseEnter={(e) => (e.target.style.color = '#007bff')}
          onMouseLeave={(e) => (e.target.style.color = 'white')}
        >
          <i className="bi bi-box-arrow-right me-2" />
          Log Out
        </Nav.Link>
      </Nav>
    </div>
    </>
  );
}
