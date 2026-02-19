import React from 'react';
import { Layout, Tooltip } from 'antd';
import {
  DashboardOutlined,
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
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
  { key: ROUTES.ADMIN_TOURNAMENTS + '/jornadas', icon: <CalendarOutlined />, label: 'Jornadas', disabled: true },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    menuItems.find(
      item => !item.disabled && (location.pathname === item.key || location.pathname.startsWith(item.key + '/'))
    )?.key || ROUTES.ADMIN_DASHBOARD;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={64}
      width={220}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        background: '#ffffff',
        borderRight: '1px solid #f1f5f9',
      }}
      trigger={null}
    >
      {/* Logo */}
      <div
        style={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4,
          padding: '0 12px',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#1B3C73',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          LM
        </div>
        {!collapsed && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 160,
            }}
          >
            Liga Metropolitana
          </span>
        )}
      </div>

      {/* Nav items */}
      <div style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems
          .filter(item => !item.disabled)
          .map(item => {
            const isActive = item.key === selectedKey;
            const navItem = (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#1B3C73' : '#64748b',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                    (e.currentTarget as HTMLDivElement).style.color = '#1e293b';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color = '#64748b';
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            );

            return collapsed ? (
              <Tooltip key={item.key} title={item.label} placement="right">
                {navItem}
              </Tooltip>
            ) : (
              navItem
            );
          })}
      </div>
    </Sider>
  );
};
