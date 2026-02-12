import React, { useState } from 'react';
import { Layout, Menu, Grid, Button, Drawer } from 'antd';
import { MenuOutlined, TrophyOutlined, OrderedListOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: ROUTES.HOME, icon: <HomeOutlined />, label: 'Inicio' },
  { key: ROUTES.STANDINGS, icon: <OrderedListOutlined />, label: 'Posiciones' },
  { key: ROUTES.RESULTS, icon: <TrophyOutlined />, label: 'Resultados' },
];

export const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = menuItems.find(item =>
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || ROUTES.HOME;

  if (!screens.md) {
    return (
      <>
        <Header style={{
          background: '#1B3C73',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
            Liga Metropolitana FF
          </span>
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
          />
        </Header>
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={260}
        >
          <Menu
            mode="vertical"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
              setDrawerOpen(false);
            }}
          />
        </Drawer>
      </>
    );
  }

  return (
    <Header style={{
      background: '#1B3C73',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginRight: 40 }}>
        Liga Metropolitana FF
      </span>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ background: 'transparent', flex: 1, borderBottom: 'none' }}
      />
    </Header>
  );
};
