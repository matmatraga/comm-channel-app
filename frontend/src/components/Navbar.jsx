// frontend/src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeStyle = {
    fontWeight: 'bold',
    color: 'blue',
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : undefined)} end>
        Home
      </NavLink>{' '}
      |{' '}
      <NavLink to="/login" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        Login
      </NavLink>{' '}
      |{' '}
      <NavLink to="/register" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        Register
      </NavLink>{' '}
      |{' '}
      <NavLink to="/logout" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        Logout
      </NavLink>{' '}
      |{' '}
      <NavLink to="/chat" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        Chat
      </NavLink>{' '}
      |{' '}
      <NavLink to="/sms" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        SMS
      </NavLink>{' '}
      |{' '}
      <NavLink to="/voice" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
        Voice
      </NavLink>
    </nav>
  );
};

export default Navbar;
