import React from 'react';
import { Row, Col, Form, Input, Button, Typography, Space } from 'antd';
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
    <Row style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <Col
        flex="1"
        style={{
          backgroundColor: '#1B3C73',
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Space direction="vertical" size={24}>
          {/* Logo */}
          <Space size={12} align="center">
            <div style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.125)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>LM</Text>
            </div>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 20 }}>
              Liga Metropolitana
            </Text>
          </Space>

          {/* Tagline */}
          <Space direction="vertical" size={12}>
            <Title
              level={1}
              style={{
                color: '#fff',
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                letterSpacing: -2,
                lineHeight: 1.1,
              }}
            >
              Flag Football
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.73)', fontSize: 20 }}>
              Caracas, Venezuela
            </Text>
          </Space>
        </Space>

        <Text style={{ color: 'rgba(255,255,255,0.53)', fontSize: 14 }}>
          Sistema de gestion de torneos, equipos y resultados.
        </Text>
      </Col>

      {/* Right panel */}
      <Col
        style={{
          width: 520,
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 64px',
        }}
      >
        <div style={{ width: 360 }}>
          <Space direction="vertical" size={32} style={{ width: '100%' }}>
            {/* Header */}
            <Space direction="vertical" size={8}>
              <Title
                level={2}
                style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: -1 }}
              >
                Iniciar Sesion
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Ingresa tus credenciales de administrador
              </Text>
            </Space>

            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Form.Item
                  name="email"
                  label={<Text strong style={{ fontSize: 13 }}>Correo electronico</Text>}
                  rules={[
                    { required: true, message: 'Ingresa tu email' },
                    { type: 'email', message: 'Email invalido' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="admin@ligametropolitana.com"
                    autoComplete="email"
                    style={{ height: 40, fontSize: 14 }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<Text strong style={{ fontSize: 13 }}>Contrasena</Text>}
                  rules={[{ required: true, message: 'Ingresa tu contrasena' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input.Password
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ height: 40, fontSize: 14 }}
                  />
                </Form.Item>
              </Space>

              <Space direction="vertical" size={16} style={{ width: '100%', marginTop: 16 }}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loginLoading}
                    block
                    style={{
                      height: 44,
                      backgroundColor: '#1B3C73',
                      borderColor: '#1B3C73',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Iniciar Sesion
                  </Button>
                </Form.Item>

                <Text
                  type="secondary"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Olvidaste tu contrasena?
                </Text>
              </Space>
            </Form>
          </Space>
        </div>
      </Col>
    </Row>
  );
};
