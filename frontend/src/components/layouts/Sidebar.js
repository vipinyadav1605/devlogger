import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/journal', label: 'Journal' },
    { path: '/projects', label: 'Projects' },
    { path: '/skills', label: 'Skills' },
    { path: '/resources', label: 'Resources' },
    { path: '/snippets', label: 'Code Snippets' },
    { path: '/goals', label: 'Goals' },
    { path: '/activities', label: 'Activities' },
    { path: '/github', label: 'GitHub' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="sidebar sticky-top">
      <div className="sidebar-inner">
        <h3 className="sidebar-brand">
          <span className="brand-mark">DL</span>
          DevLogger
        </h3>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
