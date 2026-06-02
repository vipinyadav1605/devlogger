import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout=({ onLogout }) =>{
  return (
    <Container fluid className="app-shell">
      <Row className="g-0">
        <Col md={3} lg={2} className="p-0">
          <Sidebar />
        </Col>
        <Col md={9} lg={10} className="p-0 app-main">
          <Header onLogout={onLogout} />
          <main className="page-content">
            <Outlet />
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
