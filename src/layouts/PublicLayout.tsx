import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PublicFooter } from './components/PublicFooter';

const { Content } = Layout;

export const PublicLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content style={{ padding: '16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
      <PublicFooter />
    </Layout>
  );
};
