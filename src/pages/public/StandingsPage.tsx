import React from 'react';
import { Table, Typography, Select, Space, Grid, Card, List, Avatar, Tag, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import { useStandings } from '../../features/standings/hooks/useStandings';
import { useActiveTournament } from '../../features/tournaments/hooks/useActiveTournament';
import { useMatchdays } from '../../features/matches/hooks/useMatchdays';
import type { Standing } from '../../features/standings/types/standings.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const StandingsPage: React.FC = () => {
  const { tournamentId: paramTournamentId } = useParams<{ tournamentId: string }>();
  const { activeTournament, allTournaments, selectTournament } = useActiveTournament();
  const currentTournamentId = paramTournamentId || activeTournament?.id;
  const { standings, loading, fetchByMatchday } = useStandings(currentTournamentId, true);
  const { matchdays } = useMatchdays(currentTournamentId);
  const screens = useBreakpoint();

  const handleTournamentChange = (id: string) => selectTournament(id);
  const handleMatchdayFilter = (value: number | undefined) => {
    if (value === undefined) {
      // Reset handled by useStandings realtime subscription
      window.location.reload();
    } else {
      fetchByMatchday(value);
    }
  };

  const columns: ColumnsType<Standing> = [
    { title: '#', dataIndex: 'rank', key: 'rank', width: 50, align: 'center', fixed: 'left' },
    {
      title: 'Equipo', dataIndex: 'teamName', key: 'teamName', fixed: 'left',
      render: (name: string, record: Standing) => (
        <Space>
          <Avatar src={record.teamLogo} style={{ backgroundColor: record.teamColor }} size="small">{name.charAt(0)}</Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { title: 'JJ', dataIndex: 'played', key: 'played', width: 50, align: 'center' },
    { title: 'JG', dataIndex: 'won', key: 'won', width: 50, align: 'center' },
    { title: 'JE', dataIndex: 'drawn', key: 'drawn', width: 50, align: 'center' },
    { title: 'JP', dataIndex: 'lost', key: 'lost', width: 50, align: 'center' },
    ...(screens.md ? [
      { title: 'PF', dataIndex: 'scoreFor', key: 'scoreFor', width: 55, align: 'center' as const },
      { title: 'PC', dataIndex: 'scoreAgainst', key: 'scoreAgainst', width: 55, align: 'center' as const },
      { title: 'Dif', dataIndex: 'scoreDifference', key: 'scoreDifference', width: 55, align: 'center' as const,
        render: (v: number) => <Text type={v > 0 ? 'success' : v < 0 ? 'danger' : undefined}>{v > 0 ? `+${v}` : v}</Text>,
      },
    ] : []),
    {
      title: 'Pts', dataIndex: 'points', key: 'points', width: 55, align: 'center', fixed: 'right',
      render: (pts: number) => <Text strong style={{ fontSize: 16, color: '#1B3C73' }}>{pts}</Text>,
    },
  ];

  const renderMobileCard = (standing: Standing) => (
    <List.Item>
      <Card size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Text strong style={{ width: 24, textAlign: 'center' }}>{standing.rank}</Text>
            <Avatar src={standing.teamLogo} style={{ backgroundColor: standing.teamColor }} size="small">{standing.teamName.charAt(0)}</Avatar>
            <Text strong>{standing.teamName}</Text>
          </Space>
          <Tag color="blue" style={{ fontSize: 16, padding: '2px 12px', margin: 0 }}>{standing.points} pts</Tag>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
          <span>JJ: {standing.played}</span>
          <span>JG: {standing.won}</span>
          <span>JE: {standing.drawn}</span>
          <span>JP: {standing.lost}</span>
          <span>Dif: {standing.scoreDifference > 0 ? `+${standing.scoreDifference}` : standing.scoreDifference}</span>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>Tabla de Posiciones</Title>
        <Space wrap>
          <Select value={currentTournamentId} onChange={handleTournamentChange} style={{ minWidth: 180 }}
            placeholder="Seleccionar torneo" options={allTournaments.map(t => ({ value: t.id, label: t.name }))} />
          {matchdays.length > 0 && (
            <Select placeholder="Hasta jornada" allowClear style={{ minWidth: 150 }}
              onChange={handleMatchdayFilter} options={matchdays.map(m => ({ value: m.number, label: m.label }))} />
          )}
        </Space>
      </div>

      {loading ? <Spin size="large" style={{ display: 'block', margin: '48px auto' }} /> : (
        screens.sm ? (
          <Table columns={columns} dataSource={standings} rowKey="id" pagination={false} scroll={{ x: 500 }} size="middle"
            rowClassName={(_, index) => index < 2 ? 'standings-row-top' : ''} />
        ) : (
          <List dataSource={standings} renderItem={renderMobileCard} />
        )
      )}
    </div>
  );
};

export default StandingsPage;
