import React from 'react';
import { Card, Button, Typography, Skeleton } from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';
import { useTournaments } from '../../features/tournaments/hooks/useTournaments';
import { useTeams } from '../../features/teams/hooks/useTeams';
import { usePlayers } from '../../features/players/hooks/usePlayers';
import { useMatchdays } from '../../features/matches/hooks/useMatchdays';
import { useMatchesByMatchday } from '../../features/matches/hooks/useMatchesByMatchday';
import type { Matchday, Match } from '../../features/matches/types/match.types';

const { Text } = Typography;

// ---- Stat Card ----

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, loading }) => (
  <Card style={{ flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} title={false} />
    ) : (
      <>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1e293b',
            margin: '8px 0 4px',
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <Text style={{ fontSize: 12, color: '#94a3b8' }}>{subtitle}</Text>
      </>
    )}
  </Card>
);

// ---- Team Badge (initials with deterministic color) ----

const BADGE_COLORS = [
  '#1B3C73',
  '#F59E0B',
  '#22C55E',
  '#0EA5E9',
  '#7C3AED',
  '#EF4444',
  '#EC4899',
  '#14B8A6',
];

function getTeamColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

const TeamBadge: React.FC<{ name: string }> = ({ name }) => {
  const abbrev = name.slice(0, 2).toUpperCase();
  const color = getTeamColor(name);
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {abbrev}
    </div>
  );
};

// ---- Match Score Card ----

const MatchScoreCard: React.FC<{ match: Match }> = ({ match }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '14px 32px',
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #f1f5f9',
    }}
  >
    <TeamBadge name={match.homeTeamName} />
    <Text style={{ fontSize: 14, fontWeight: 500, flex: 1, textAlign: 'right' }}>
      {match.homeTeamName}
    </Text>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 72,
        justifyContent: 'center',
      }}
    >
      <Text strong style={{ fontSize: 22, color: '#1e293b' }}>
        {match.homeScore ?? '-'}
      </Text>
      <Text style={{ color: '#cbd5e1', fontSize: 16 }}>·</Text>
      <Text strong style={{ fontSize: 22, color: '#1e293b' }}>
        {match.awayScore ?? '-'}
      </Text>
    </div>
    <Text style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{match.awayTeamName}</Text>
    <TeamBadge name={match.awayTeamName} />
  </div>
);

// ---- Matchday Results (fetches matches for a given matchday) ----

interface MatchdayResultsProps {
  tournamentId: string;
  matchday: Matchday;
  onViewAll: () => void;
}

const MatchdayResults: React.FC<MatchdayResultsProps> = ({
  tournamentId,
  matchday,
  onViewAll,
}) => {
  const { matches, loading } = useMatchesByMatchday(tournamentId, matchday.id);
  const completed = matches.filter(m => m.status === 'completed').slice(0, 3);

  if (loading) return <Skeleton active paragraph={{ rows: 3 }} />;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text strong style={{ fontSize: 18, color: '#1e293b' }}>
          Ultimos Resultados — {matchday.label}
        </Text>
        <Button
          type="link"
          style={{ padding: 0, height: 'auto', color: '#1B3C73', fontSize: 13 }}
          onClick={onViewAll}
        >
          Ver todos
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {completed.length > 0 ? (
          completed.map(match => <MatchScoreCard key={match.id} match={match} />)
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text type="secondary">No hay resultados disponibles aun.</Text>
          </div>
        )}
      </div>
    </>
  );
};

// ---- Recent Results (fetches matchdays first) ----

interface RecentResultsProps {
  tournamentId: string | undefined;
  onViewAll: () => void;
}

const RecentResults: React.FC<RecentResultsProps> = ({ tournamentId, onViewAll }) => {
  const { matchdays, loading } = useMatchdays(tournamentId);

  const latestMatchday = [...matchdays]
    .filter(md => md.completedMatchCount > 0)
    .sort((a, b) => b.number - a.number)[0];

  if (loading) return <Skeleton active paragraph={{ rows: 3 }} />;

  if (!tournamentId || !latestMatchday) {
    return (
      <>
        <Text strong style={{ fontSize: 18, color: '#1e293b', display: 'block', marginBottom: 16 }}>
          Ultimos Resultados
        </Text>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <Text type="secondary">No hay resultados disponibles aun.</Text>
        </div>
      </>
    );
  }

  return (
    <MatchdayResults
      tournamentId={tournamentId}
      matchday={latestMatchday}
      onViewAll={onViewAll}
    />
  );
};

// ---- Dashboard Page ----

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const { teams, loading: teamsLoading } = useTeams();
  const { players, loading: playersLoading } = usePlayers();

  const activeTournament =
    tournaments.find(t => t.status === 'active') || tournaments[0];

  const { matchdays } = useMatchdays(activeTournament?.id);

  const activeTournamentCount = tournaments.filter(t => t.status === 'active').length;
  const currentMatchday =
    matchdays.find(md => md.status === 'in_progress') ||
    [...matchdays].sort((a, b) => b.number - a.number)[0];

  const avgPerTeam =
    teams.length > 0 ? Math.round(players.length / teams.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Page header */}
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#1e293b',
            lineHeight: 1.2,
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          Dashboard
        </div>
        <Text style={{ color: '#64748b', fontSize: 14 }}>
          Bienvenido al panel de administracion
        </Text>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20 }}>
        <StatCard
          label="Torneos Activos"
          value={activeTournamentCount}
          subtitle="Temporada 2026"
          loading={tournamentsLoading}
        />
        <StatCard
          label="Equipos"
          value={teams.length}
          subtitle={`+${teams.length} equipos`}
          loading={teamsLoading}
        />
        <StatCard
          label="Jugadores"
          value={players.length}
          subtitle={`${avgPerTeam} por equipo (prom)`}
          loading={playersLoading}
        />
        <StatCard
          label="Jornada Actual"
          value={currentMatchday?.number ?? 0}
          subtitle={`de ${matchdays.length} jornadas`}
          loading={false}
        />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text strong style={{ fontSize: 18, color: '#1e293b' }}>
          Acciones Rapidas
        </Text>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(ROUTES.ADMIN_TOURNAMENTS)}
          >
            Subir Resultados
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.ADMIN_TEAMS)}
          >
            Nuevo Equipo
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(ROUTES.STANDINGS)}
          >
            Ver Tabla Publica
          </Button>
        </div>
      </div>

      {/* Recent results */}
      <Card
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <RecentResults
          tournamentId={activeTournament?.id}
          onViewAll={() => navigate(ROUTES.RESULTS)}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
