import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmOptions {
  title: string;
  content: string;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const showConfirm = ({
  title,
  content,
  onOk,
  okText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
}: ConfirmOptions) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okButtonProps: danger ? { danger: true } : undefined,
    onOk,
  });
};
