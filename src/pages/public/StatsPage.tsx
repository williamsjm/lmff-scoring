import React from 'react';
import { Table, Typography, Select, Space, Avatar, Spin, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import { useActiveTournament } from '../../features/tournaments/hooks/useActiveTournament';
import { usePlayerStatsAggregate } from '../../features/players/hooks/usePlayerStats';
import type { PlayerStatAggregate } from '../../features/players/types/playerStats.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export const StatsPage: React.FC = () => {
  const { tournamentId: paramTournamentId } = useParams<{ tournamentId: string }>();
  const { activeTournament, allTournaments, selectTournament } = useActiveTournament();
  const currentTournamentId = paramTournamentId || activeTournament?.id;
  const { aggregate, loading } = usePlayerStatsAggregate(currentTournamentId ?? '');

  const columns: ColumnsType<PlayerStatAggregate> = [
    {
      title: '#', key: 'rank', width: 50, align: 'center' as const,
      render: (_: unknown, __: PlayerStatAggregate, index: number) => <Text strong>{index + 1}</Text>,
    },
    {
      title: 'Jugador', key: 'player',
      render: (_: unknown, r: PlayerStatAggregate) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1B3C73' }}>
            {r.playerNumber}
          </Avatar>
          <div>
            <Text strong>{r.playerName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.teamName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'TDs', key: 'tds', width: 70, align: 'center' as const,
      render: (_: unknown, r: PlayerStatAggregate) => {
        const total = r.tdPassing + r.tdReceiving + r.tdDefensive;
        return total > 0 ? <Tag color="gold">{total}</Tag> : <Text type="secondary">0</Text>;
      },
      sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) =>
        (a.tdPassing + a.tdReceiving + a.tdDefensive) - (b.tdPassing + b.tdReceiving + b.tdDefensive),
      defaultSortOrder: 'descend' as const,
    },
    { title: 'Comp', dataIndex: 'passCompletions', key: 'passCompletions', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.passCompletions - b.passCompletions },
    { title: 'Inc', dataIndex: 'passIncomplete', key: 'passIncomplete', width: 70, align: 'center' as const },
    { title: 'Cor', dataIndex: 'rushes', key: 'rushes', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.rushes - b.rushes },
    { title: 'Rec', dataIndex: 'receptions', key: 'receptions', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.receptions - b.receptions },
    { title: 'Flags', dataIndex: 'flagPulls', key: 'flagPulls', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.flagPulls - b.flagPulls },
    { title: 'Sacks', dataIndex: 'sacks', key: 'sacks', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.sacks - b.sacks },
    { title: 'INT', dataIndex: 'interceptions', key: 'interceptions', width: 70, align: 'center' as const, sorter: (a: PlayerStatAggregate, b: PlayerStatAggregate) => a.interceptions - b.interceptions },
    { title: 'PB', dataIndex: 'passesBlocked', key: 'passesBlocked', width: 70, align: 'center' as const },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Estadísticas</Title>
        <Select
          style={{ width: 240 }}
          placeholder="Seleccionar torneo"
          value={currentTournamentId}
          onChange={selectTournament}
          options={allTournaments.map(t => ({ value: t.id, label: t.name }))}
        />
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
      ) : (
        <Table
          rowKey="playerId"
          dataSource={aggregate}
          columns={columns}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No hay estadísticas registradas' }}
        />
      )}
    </div>
  );
};

export default StatsPage;
