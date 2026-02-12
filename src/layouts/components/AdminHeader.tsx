import React from 'react';
import { Layout, Button, Space, Dropdown, Typography, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const dropdownItems = {
    items: [
      {
        key: 'public',
        icon: <EyeOutlined />,
        label: 'Ver sitio publico',
        onClick: () => navigate(ROUTES.HOME),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Cerrar sesion',
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  return (
    <Header style={{
      padding: '0 24px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16 }}
      />
      <Space>
        {screens.md && <Text type="secondary">{user?.email}</Text>}
        <Dropdown menu={dropdownItems} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />} />
        </Dropdown>
      </Space>
    </Header>
  );
};
