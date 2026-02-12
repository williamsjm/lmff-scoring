import React from 'react';
import { Row, Col, Card, Statistic, Button, Space, Typography } from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';
import { useTournaments } from '../../features/tournaments/hooks/useTournaments';
import { useTeams } from '../../features/teams/hooks/useTeams';
import { usePlayers } from '../../features/players/hooks/usePlayers';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tournaments } = useTournaments();
  const { teams } = useTeams();
  const { players } = usePlayers();

  const activeTournaments = tournaments.filter(t => t.status === 'active').length;

  return (
    <div>
      <Title level={4}>Dashboard</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="Torneos Activos" value={activeTournaments} prefix={<TrophyOutlined />} valueStyle={{ color: '#1B3C73' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="Equipos" value={teams.length} prefix={<TeamOutlined />} valueStyle={{ color: '#1B3C73' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="Jugadores" value={players.length} prefix={<UserOutlined />} valueStyle={{ color: '#1B3C73' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic title="Total Torneos" value={tournaments.length} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
      </Row>
      <Title level={5}>Acciones Rapidas</Title>
      <Space wrap>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTES.ADMIN_TOURNAMENTS)}>
          Gestionar Torneos
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => navigate(ROUTES.ADMIN_TEAMS)}>
          Nuevo Equipo
        </Button>
        <Button icon={<EyeOutlined />} onClick={() => navigate(ROUTES.STANDINGS)}>
          Ver Tabla Publica
        </Button>
      </Space>
    </div>
  );
};

export default DashboardPage;
