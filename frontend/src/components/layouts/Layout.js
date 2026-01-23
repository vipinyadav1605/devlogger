import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout=({ onLogout }) =>{
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-0">
          <Sidebar />
        </Col>
        <Col md={10} className="p-0">
          <Header onLogout={onLogout} />
          <div className="p-4">
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Layout;