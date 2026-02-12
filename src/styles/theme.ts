import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1B3C73',
    fontFamily: "'Inter', sans-serif",
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      bodyBg: '#f0f2f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1B3C73',
    },
    Table: {
      headerBg: '#1B3C73',
      headerColor: '#ffffff',
      headerSortActiveBg: '#15305c',
      headerSortHoverBg: '#15305c',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(27, 60, 115, 0.1)',
    },
  },
};
