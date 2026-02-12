import React from 'react';
import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { OrderedListOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ color: '#1B3C73' }}>Liga Metropolitana de Flag Football</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Caracas, Venezuela - Resultados, posiciones y mas
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={10}>
          <Card hoverable style={{ textAlign: 'center', height: '100%' }} onClick={() => navigate(ROUTES.STANDINGS)}>
            <OrderedListOutlined style={{ fontSize: 48, color: '#1B3C73', marginBottom: 16 }} />
            <Title level={4}>Tabla de Posiciones</Title>
            <Paragraph type="secondary">Consulta las posiciones actualizadas de todos los equipos</Paragraph>
            <Button type="primary">Ver Posiciones</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={10}>
          <Card hoverable style={{ textAlign: 'center', height: '100%' }} onClick={() => navigate(ROUTES.RESULTS)}>
            <TrophyOutlined style={{ fontSize: 48, color: '#1B3C73', marginBottom: 16 }} />
            <Title level={4}>Resultados</Title>
            <Paragraph type="secondary">Revisa los resultados de cada jornada del torneo</Paragraph>
            <Button type="primary">Ver Resultados</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
