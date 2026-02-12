import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  tip?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  tip = 'Cargando...',
  fullScreen = false,
}) => {
  const style: React.CSSProperties = fullScreen
    ? { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }
    : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' };

  return (
    <div style={style}>
      <Spin size="large" tip={tip}>
        <div style={{ padding: '50px' }} />
      </Spin>
    </div>
  );
};
