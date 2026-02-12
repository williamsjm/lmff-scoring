import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  description = 'No hay datos',
  actionLabel,
  onAction,
}) => {
  return (
    <Empty description={description} style={{ padding: '48px 0' }}>
      {actionLabel && onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Empty>
  );
};
