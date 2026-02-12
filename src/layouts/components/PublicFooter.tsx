import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export const PublicFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '16px' }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Liga Metropolitana de Flag Football - Caracas, Venezuela &copy; {new Date().getFullYear()}
      </Text>
    </Footer>
  );
};
