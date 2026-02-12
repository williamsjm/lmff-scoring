import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  { key: ROUTES.ADMIN_DASHBOARD, icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: ROUTES.ADMIN_TOURNAMENTS, icon: <TrophyOutlined />, label: 'Torneos' },
  { key: ROUTES.ADMIN_TEAMS, icon: <TeamOutlined />, label: 'Equipos' },
  { key: ROUTES.ADMIN_PLAYERS, icon: <UserOutlined />, label: 'Jugadores' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems.find(item =>
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || ROUTES.ADMIN_DASHBOARD;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? 14 : 16,
        fontWeight: 700,
        letterSpacing: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        {collapsed ? 'LMFF' : 'LMFF Admin'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};
