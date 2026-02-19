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
      headerBg: '#F5F5F5',
      headerColor: '#5E5E5E',
      headerSortActiveBg: '#EBEBEB',
      headerSortHoverBg: '#EBEBEB',
      headerSplitColor: '#E5E5E5',
      cellPaddingInline: 20,
      borderColor: '#E5E5E5',
      rowHoverBg: '#FAFAFA',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(27, 60, 115, 0.1)',
    },
  },
};
