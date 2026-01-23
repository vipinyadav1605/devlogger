import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar=()=> {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '', label: 'Dashboard' },
    { path: '/journal', icon: '', label: 'Journal' },
    { path: '/projects', icon: '', label: 'Projects' },
    { path: '/skills', icon: '', label: 'Skills' },
    { path: '/resources', icon: '', label: 'Resources' },
    { path: '/snippets', icon: '', label: 'Code Snippets' },
    { path: '/goals', icon: '', label: 'Goals' },
    { path: '/activities', icon: '', label: 'Activities' },
     { path: '/github', icon: '', label: 'GitHub' }, 
    { path: '/profile', icon: '', label: 'Profile' },
  ];

  return (
    <div className="sidebar sticky-top">
      <div className="p-4">
        <h3 className="text-white fw-bold mb-4">
          <span style={{ fontSize: '1.5rem' }}></span> DevLogger
        </h3>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="me-2" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;