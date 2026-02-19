import React, { useState, useEffect } from 'react';
import { Typography, Select, Space, Card, Avatar, Tag, Button, Spin, Grid } from 'antd';
import { LeftOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useActiveTournament } from '../../features/tournaments/hooks/useActiveTournament';
import { useMatchdays } from '../../features/matches/hooks/useMatchdays';
import { useMatchesByMatchday } from '../../features/matches/hooks/useMatchesByMatchday';
import { EmptyState } from '../../shared/components/EmptyState';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ResultsPage: React.FC = () => {
  const { tournamentId: paramTournamentId, matchdayId: paramMatchdayId } = useParams<{ tournamentId: string; matchdayId: string }>();
  const { activeTournament, allTournaments, selectTournament } = useActiveTournament();
  const currentTournamentId = paramTournamentId || activeTournament?.id;
  const { matchdays } = useMatchdays(currentTournamentId);
  const [selectedMatchdayId, setSelectedMatchdayId] = useState<string | undefined>(paramMatchdayId);
  const { matches, loading } = useMatchesByMatchday(currentTournamentId, selectedMatchdayId);
  const screens = useBreakpoint();

  useEffect(() => {
    if (!selectedMatchdayId && matchdays.length > 0) {
      const lastCompleted = [...matchdays].reverse().find(m => m.status === 'completed' || m.status === 'in_progress');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMatchdayId(lastCompleted?.id || matchdays[matchdays.length - 1]?.id);
    }
  }, [matchdays, selectedMatchdayId]);

  const currentMatchdayIndex = matchdays.findIndex(m => m.id === selectedMatchdayId);
  const currentMatchday = matchdays[currentMatchdayIndex];

  const goToPrev = () => {
    if (currentMatchdayIndex > 0) setSelectedMatchdayId(matchdays[currentMatchdayIndex - 1].id);
  };
  const goToNext = () => {
    if (currentMatchdayIndex < matchdays.length - 1) setSelectedMatchdayId(matchdays[currentMatchdayIndex + 1].id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>Resultados</Title>
        <Select value={currentTournamentId} onChange={(id) => { selectTournament(id); setSelectedMatchdayId(undefined); }}
          style={{ minWidth: 180 }} placeholder="Seleccionar torneo" options={allTournaments.map(t => ({ value: t.id, label: t.name }))} />
      </div>

      {matchdays.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <Button icon={<LeftOutlined />} disabled={currentMatchdayIndex <= 0} onClick={goToPrev} />
          {screens.sm ? (
            <Space className="matchday-nav" style={{ overflow: 'auto', maxWidth: 400 }}>
              {matchdays.map(md => (
                <Tag key={md.id} color={md.id === selectedMatchdayId ? '#1B3C73' : 'default'}
                  style={{ cursor: 'pointer', padding: '4px 12px' }} onClick={() => setSelectedMatchdayId(md.id)}>
                  {md.label}
                </Tag>
              ))}
            </Space>
          ) : (
            <Select value={selectedMatchdayId} onChange={setSelectedMatchdayId} style={{ minWidth: 150 }}
              options={matchdays.map(m => ({ value: m.id, label: m.label }))} />
          )}
          <Button icon={<RightOutlined />} disabled={currentMatchdayIndex >= matchdays.length - 1} onClick={goToNext} />
        </div>
      )}

      {loading ? <Spin size="large" style={{ display: 'block', margin: '48px auto' }} /> : (
        matches.length === 0 ? <EmptyState description="No hay partidos en esta jornada" /> : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {currentMatchday && (
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                {currentMatchday.label}
              </Text>
            )}
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {matches.map(match => (
                <Card key={match.id} size="small">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <Space>
                        <Text strong style={{ fontSize: screens.sm ? 14 : 12 }}>{match.homeTeamName}</Text>
                        <Avatar src={match.homeTeamLogo} size="small">{match.homeTeamName?.charAt(0)}</Avatar>
                      </Space>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      {match.status === 'completed' ? (
                        <Text strong style={{ fontSize: 20, color: '#1B3C73' }}>
                          {match.homeScore} : {match.awayScore}
                        </Text>
                      ) : (
                        <Text type="secondary">{match.time || 'vs'}</Text>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <Space>
                        <Avatar src={match.awayTeamLogo} size="small">{match.awayTeamName?.charAt(0)}</Avatar>
                        <Text strong style={{ fontSize: screens.sm ? 14 : 12 }}>{match.awayTeamName}</Text>
                      </Space>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 4 }}>
                    {match.status === 'completed' ? (
                      <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 11 }}>Final</Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="processing" style={{ fontSize: 11 }}>Programado</Tag>
                    )}
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )
      )}
    </div>
  );
};

export default ResultsPage;
