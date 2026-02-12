import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes';

const { Title, Text } = Typography;

export const LoginForm: React.FC = () => {
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch {
      // Error already handled in useAuth
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '24px',
    }}>
      <Card
        style={{ width: '100%', maxWidth: 400 }}
        styles={{ body: { padding: '32px 24px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0, color: '#1B3C73' }}>
            Liga Metropolitana
          </Title>
          <Text type="secondary">Flag Football - Panel de Administracion</Text>
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Ingresa tu email' },
              { type: 'email', message: 'Email invalido' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contrasena' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contrasena" autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loginLoading} block>
              Iniciar Sesion
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
