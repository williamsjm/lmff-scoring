import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Card,
  Button,
  Space,
  Typography,
  InputNumber,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  TimePicker,
  Breadcrumb,
  Row,
  Col,
  Avatar,
  Spin,
  App,
  Tabs,
  Table,
  message,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePlayerStats } from "../../features/players/hooks/usePlayerStats";
import { usePlayers } from "../../features/players/hooks/usePlayers";
import type { PlayerStat } from "../../features/players/types/playerStats.types";
import type { Player } from "../../features/players/types/player.types";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMatchesByMatchday } from "../../features/matches/hooks/useMatchesByMatchday";
import { useMatchdays } from "../../features/matches/hooks/useMatchdays";
import { useTournaments } from "../../features/tournaments/hooks/useTournaments";
import { useTeams } from "../../features/teams/hooks/useTeams";
import type {
  Match,
  MatchFormValues,
  MatchScoreUpdate,
} from "../../features/matches/types/match.types";
import { EmptyState } from "../../shared/components/EmptyState";

const { Title, Text } = Typography;

// ─── Section accent palette ──────────────────────────────────────────────────
const SECTION_COLORS = {
  qb: {
    bg: "#e8f0fb",
    border: "#1B3C73",
    text: "#1B3C73",
    light: "#d0e0f7",
    headerBg: "#1B3C73",
  },
  receptor: {
    bg: "#e6f7f5",
    border: "#2A9D8F",
    text: "#2A9D8F",
    light: "#c5ede9",
    headerBg: "#2A9D8F",
  },
  defensiva: {
    bg: "#fdecea",
    border: "#E63946",
    text: "#E63946",
    light: "#f9c8cb",
    headerBg: "#E63946",
  },
} as const;

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ScoreState {
  [matchId: string]: { homeScore: number | null; awayScore: number | null };
}

type StatRow = {
  playerId: string;
  statId?: string;
  passCompletions: number;
  passIncomplete: number;
  rushes: number;
  tdPassing: number;
  receptions: number;
  tdReceiving: number;
  flagPulls: number;
  sacks: number;
  interceptions: number;
  passesBlocked: number;
  tdDefensive: number;
};

type StatsState = { [playerId: string]: StatRow };

// ─── StatInput ────────────────────────────────────────────────────────────────

const StatInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}> = ({ value, onChange, accentColor = "#1677ff" }) => (
  <InputNumber
    min={0}
    max={99}
    value={value}
    controls={false}
    onChange={(v) => onChange(v ?? 0)}
    size="small"
    style={{
      width: 46,
      textAlign: "center",
      borderRadius: 8,
      fontWeight: value > 0 ? 700 : 400,
      color: value > 0 ? accentColor : undefined,
      borderColor: value > 0 ? accentColor : undefined,
      boxShadow: value > 0 ? `0 0 0 1px ${accentColor}33` : undefined,
      transition: "all 0.2s ease",
    }}
  />
);

// ─── Section header divider ───────────────────────────────────────────────────

const SectionHeader: React.FC<{
  label: string;
  color: string;
  bgColor: string;
}> = ({ label, color, bgColor }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "2px 10px",
      borderRadius: 6,
      backgroundColor: bgColor,
      border: `1.5px solid ${color}`,
    }}
  >
    <div
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: color,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  </div>
);

// ─── EmptyTeam ────────────────────────────────────────────────────────────────

const EmptyTeam: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 0",
      gap: 8,
    }}
  >
    <Avatar
      size={48}
      icon={<UserOutlined />}
      style={{ backgroundColor: "#f0f2f5", color: "#bfbfbf" }}
    />
    <Text type="secondary" style={{ fontSize: 13 }}>
      No hay jugadores registrados para este equipo
    </Text>
  </div>
);

// ─── StatsModalContent ────────────────────────────────────────────────────────

const StatsModalContent: React.FC<{
  tournamentId: string;
  match: {
    id: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
  };
  players: Player[];
  onClose: () => void;
}> = ({ tournamentId, match, players, onClose }) => {
  const { stats, loading, createStat, updateStat } = usePlayerStats(
    tournamentId,
    match.id,
  );
  const [saving, setSaving] = useState(false);

  const initialState = useMemo<StatsState>(() => {
    const state: StatsState = {};
    const existing = new Map<string, PlayerStat>(
      stats.map((s) => [s.playerId, s]),
    );
    for (const p of players.filter(
      (p) => p.teamId === match.homeTeamId || p.teamId === match.awayTeamId,
    )) {
      const ex = existing.get(p.id);
      state[p.id] = {
        playerId: p.id,
        statId: ex?.id,
        passCompletions: ex?.passCompletions ?? 0,
        passIncomplete: ex?.passIncomplete ?? 0,
        rushes: ex?.rushes ?? 0,
        tdPassing: ex?.tdPassing ?? 0,
        receptions: ex?.receptions ?? 0,
        tdReceiving: ex?.tdReceiving ?? 0,
        flagPulls: ex?.flagPulls ?? 0,
        sacks: ex?.sacks ?? 0,
        interceptions: ex?.interceptions ?? 0,
        passesBlocked: ex?.passesBlocked ?? 0,
        tdDefensive: ex?.tdDefensive ?? 0,
      };
    }
    return state;
  }, [stats, players, match]);

  const [statsState, setStatsState] = useState<StatsState>(initialState);

  // Sync when stats load
  React.useEffect(() => {
    setStatsState(initialState);
  }, [initialState]);

  const setField = (
    playerId: string,
    field: keyof Omit<StatRow, "playerId" | "statId">,
    value: number,
  ) => {
    setStatsState((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ops = Object.values(statsState).filter((row) => {
        const { statId: _statId, playerId: _playerId, ...fields } = row;
        return Object.values(fields).some((v) => v > 0);
      });
      await Promise.all(
        ops.map((row) => {
          const { statId, ...data } = row;
          return statId ? updateStat(statId, data) : createStat(data);
        }),
      );
      message.success("Estadísticas guardadas");
      onClose();
    } catch {
      message.error("Error al guardar estadísticas");
    } finally {
      setSaving(false);
    }
  };

  // Count players with at least one non-zero stat
  const playersWithStats = useMemo(
    () =>
      Object.values(statsState).filter((row) => {
        const { statId: _statId, playerId: _playerId, ...fields } = row;
        return Object.values(fields).some((v) => v > 0);
      }).length,
    [statsState],
  );

  // Build columns for a given team, grouping child columns under colored section headers
  const buildColumns = (teamId: string) => {
    const teamPlayers = players
      .filter((p) => p.teamId === teamId)
      .sort((a, b) => a.number - b.number);

    const cols = [
      {
        title: (
          <Text type="secondary" style={{ fontSize: 11 }}>
            #
          </Text>
        ),
        width: 48,
        fixed: "left" as const,
        render: (_: unknown, p: Player) => (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: "#1B3C73",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              margin: "0 auto",
              flexShrink: 0,
            }}
          >
            {p.number}
          </div>
        ),
      },
      {
        title: (
          <Text type="secondary" style={{ fontSize: 11 }}>
            Jugador
          </Text>
        ),
        width: 140,
        fixed: "left" as const,
        render: (_: unknown, p: Player) => (
          <Text
            strong
            style={{ fontSize: 13, whiteSpace: "nowrap" }}
            title={p.name}
          >
            {p.name}
          </Text>
        ),
      },
      // ── QB section ──────────────────────────────────────────────────────────
      {
        title: (
          <SectionHeader
            label="QB"
            color={SECTION_COLORS.qb.text}
            bgColor={SECTION_COLORS.qb.bg}
          />
        ),
        children: [
          {
            title: (
              <Tooltip title="Pases completados">
                <span style={{ fontSize: 11, color: SECTION_COLORS.qb.text }}>
                  Comp
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.passCompletions ?? 0}
                onChange={(v) => setField(p.id, "passCompletions", v)}
                accentColor={SECTION_COLORS.qb.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Pases incompletos">
                <span style={{ fontSize: 11, color: SECTION_COLORS.qb.text }}>
                  Inc
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.passIncomplete ?? 0}
                onChange={(v) => setField(p.id, "passIncomplete", v)}
                accentColor={SECTION_COLORS.qb.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Corridas">
                <span style={{ fontSize: 11, color: SECTION_COLORS.qb.text }}>
                  Cor
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.rushes ?? 0}
                onChange={(v) => setField(p.id, "rushes", v)}
                accentColor={SECTION_COLORS.qb.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Touchdowns por pase">
                <span style={{ fontSize: 11, color: SECTION_COLORS.qb.text }}>
                  TD
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.tdPassing ?? 0}
                onChange={(v) => setField(p.id, "tdPassing", v)}
                accentColor={SECTION_COLORS.qb.border}
              />
            ),
          },
        ],
      },
      // ── Receptor section ─────────────────────────────────────────────────────
      {
        title: (
          <SectionHeader
            label="Receptor"
            color={SECTION_COLORS.receptor.text}
            bgColor={SECTION_COLORS.receptor.bg}
          />
        ),
        children: [
          {
            title: (
              <Tooltip title="Recepciones">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.receptor.text,
                  }}
                >
                  Rec
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.receptions ?? 0}
                onChange={(v) => setField(p.id, "receptions", v)}
                accentColor={SECTION_COLORS.receptor.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Touchdowns por recepción">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.receptor.text,
                  }}
                >
                  TD
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.tdReceiving ?? 0}
                onChange={(v) => setField(p.id, "tdReceiving", v)}
                accentColor={SECTION_COLORS.receptor.border}
              />
            ),
          },
        ],
      },
      // ── Defensiva section ────────────────────────────────────────────────────
      {
        title: (
          <SectionHeader
            label="Defensiva"
            color={SECTION_COLORS.defensiva.text}
            bgColor={SECTION_COLORS.defensiva.bg}
          />
        ),
        children: [
          {
            title: (
              <Tooltip title="Banderas jaladas">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.defensiva.text,
                  }}
                >
                  Flags
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.flagPulls ?? 0}
                onChange={(v) => setField(p.id, "flagPulls", v)}
                accentColor={SECTION_COLORS.defensiva.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Sacks">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.defensiva.text,
                  }}
                >
                  Sack
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.sacks ?? 0}
                onChange={(v) => setField(p.id, "sacks", v)}
                accentColor={SECTION_COLORS.defensiva.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Intercepciones">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.defensiva.text,
                  }}
                >
                  INT
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.interceptions ?? 0}
                onChange={(v) => setField(p.id, "interceptions", v)}
                accentColor={SECTION_COLORS.defensiva.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Pases bloqueados">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.defensiva.text,
                  }}
                >
                  PB
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.passesBlocked ?? 0}
                onChange={(v) => setField(p.id, "passesBlocked", v)}
                accentColor={SECTION_COLORS.defensiva.border}
              />
            ),
          },
          {
            title: (
              <Tooltip title="Touchdowns defensivos">
                <span
                  style={{
                    fontSize: 11,
                    color: SECTION_COLORS.defensiva.text,
                  }}
                >
                  TD
                </span>
              </Tooltip>
            ),
            width: 56,
            render: (_: unknown, p: Player) => (
              <StatInput
                value={statsState[p.id]?.tdDefensive ?? 0}
                onChange={(v) => setField(p.id, "tdDefensive", v)}
                accentColor={SECTION_COLORS.defensiva.border}
              />
            ),
          },
        ],
      },
    ];

    return { teamPlayers, cols };
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 0",
          gap: 12,
        }}
      >
        <Spin size="large" />
        <Text type="secondary" style={{ fontSize: 13 }}>
          Cargando estadísticas...
        </Text>
      </div>
    );
  }

  const home = buildColumns(match.homeTeamId);
  const away = buildColumns(match.awayTeamId);

  // ── Tab label helper ──────────────────────────────────────────────────────
  const tabLabel = (name: string, color: string) => (
    <Space size={8} style={{ padding: "2px 0" }}>
      <Avatar
        size={22}
        style={{
          backgroundColor: color,
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
    </Space>
  );

  // ── Row styling: alternate background ────────────────────────────────────
  const rowClassName = (_: Player, index: number) =>
    index % 2 === 0 ? "stats-row-even" : "stats-row-odd";

  return (
    <div>
      {/* Inline styles for row striping and header group colors */}
      <style>{`
        .stats-table .ant-table-thead > tr > th {
          background: #fafafa;
          padding: 6px 8px;
        }
        .stats-table .ant-table-tbody > tr.stats-row-even > td {
          background: #ffffff;
        }
        .stats-table .ant-table-tbody > tr.stats-row-odd > td {
          background: #f7f9fc;
        }
        .stats-table .ant-table-tbody > tr > td {
          padding: 8px 8px;
          vertical-align: middle;
        }
        .stats-table .ant-table-cell-fix-left {
          z-index: 2;
        }
        .stats-table .ant-input-number-input {
          text-align: center !important;
        }
      `}</style>

      <Tabs
        size="small"
        tabBarStyle={{ marginBottom: 12 }}
        items={[
          {
            key: "home",
            label: tabLabel(match.homeTeamName, "#1B3C73"),
            children:
              home.teamPlayers.length === 0 ? (
                <EmptyTeam />
              ) : (
                <Table
                  className="stats-table"
                  rowKey="id"
                  dataSource={home.teamPlayers}
                  columns={home.cols}
                  pagination={false}
                  size="small"
                  bordered={false}
                  scroll={{ x: "max-content" }}
                  rowClassName={rowClassName}
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #e8ecf3",
                  }}
                />
              ),
          },
          {
            key: "away",
            label: tabLabel(match.awayTeamName, "#2A9D8F"),
            children:
              away.teamPlayers.length === 0 ? (
                <EmptyTeam />
              ) : (
                <Table
                  className="stats-table"
                  rowKey="id"
                  dataSource={away.teamPlayers}
                  columns={away.cols}
                  pagination={false}
                  size="small"
                  bordered={false}
                  scroll={{ x: "max-content" }}
                  rowClassName={rowClassName}
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #e8ecf3",
                  }}
                />
              ),
          },
        ]}
      />

      {/* Save footer */}
      <Divider style={{ margin: "12px 0 14px" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          {playersWithStats > 0 ? (
            <>
              <Badge
                count={playersWithStats}
                style={{
                  backgroundColor: "#1B3C73",
                  fontSize: 11,
                  marginRight: 6,
                }}
              />
              {playersWithStats === 1
                ? "jugador con estadísticas"
                : "jugadores con estadísticas"}
            </>
          ) : (
            "Sin estadísticas ingresadas"
          )}
        </Text>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            paddingInline: 20,
            height: 36,
            backgroundColor: "#1B3C73",
            borderColor: "#1B3C73",
          }}
        >
          Guardar estadísticas
        </Button>
      </div>
    </div>
  );
};

// ─── MatchResultsPage (unchanged) ─────────────────────────────────────────────

const MatchResultsPage: React.FC = () => {
  const { id: tournamentId, mdId: matchdayId } = useParams<{
    id: string;
    mdId: string;
  }>();
  const navigate = useNavigate();
  const { matches, loading, createMatch, updateScoresBatch } =
    useMatchesByMatchday(tournamentId, matchdayId);
  const { matchdays } = useMatchdays(tournamentId);
  const { tournaments } = useTournaments();
  const { teams } = useTeams();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  const matchday = matchdays.find((m) => m.id === matchdayId);
  const [scores, setScores] = useState<ScoreState>({});
  const [saving, setSaving] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [statsMatch, setStatsMatch] = useState<Match | null>(null);
  const [matchForm] = Form.useForm();
  const { players } = usePlayers();
  const { modal } = App.useApp();

  const tournamentTeams = teams.filter((t) =>
    tournament?.teamIds?.includes(t.id),
  );

  const getScore = (match: Match, side: "home" | "away"): number | null => {
    const override = scores[match.id];
    if (override)
      return side === "home" ? override.homeScore : override.awayScore;
    return side === "home" ? match.homeScore : match.awayScore;
  };

  const setMatchScore = (
    matchId: string,
    side: "home" | "away",
    value: number | null,
  ) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        homeScore: side === "home" ? value : (prev[matchId]?.homeScore ?? null),
        awayScore: side === "away" ? value : (prev[matchId]?.awayScore ?? null),
      },
    }));
  };

  const handleSaveAll = () => {
    const updates: MatchScoreUpdate[] = [];
    for (const match of matches) {
      const homeScore = getScore(match, "home");
      const awayScore = getScore(match, "away");
      if (
        homeScore !== null &&
        awayScore !== null &&
        match.status !== "completed"
      ) {
        updates.push({ matchId: match.id, homeScore, awayScore });
      }
    }

    for (const matchId of Object.keys(scores)) {
      const match = matches.find((m) => m.id === matchId);
      if (match && match.status === "completed") {
        const s = scores[matchId];
        if (
          s.homeScore !== null &&
          s.awayScore !== null &&
          (s.homeScore !== match.homeScore || s.awayScore !== match.awayScore)
        ) {
          updates.push({
            matchId,
            homeScore: s.homeScore,
            awayScore: s.awayScore,
          });
        }
      }
    }
    if (updates.length === 0) return;

    modal.confirm({
      title: "Guardar resultados",
      content: (
        <div>
          <p>Se guardaran {updates.length} resultado(s):</p>
          {updates.map((u) => {
            const m = matches.find((match) => match.id === u.matchId);
            return m ? (
              <p key={u.matchId}>
                {m.homeTeamName} {u.homeScore} - {u.awayScore} {m.awayTeamName}
              </p>
            ) : null;
          })}
        </div>
      ),
      okText: "Guardar",
      cancelText: "Cancelar",
      onOk: async () => {
        setSaving(true);
        try {
          await updateScoresBatch(updates);
          setScores({});
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleCreateMatch = async () => {
    try {
      const values = await matchForm.validateFields();
      const formData: MatchFormValues = {
        homeTeamId: values.homeTeamId,
        awayTeamId: values.awayTeamId,
        date: values.date.toISOString(),
        time: values.time?.format("HH:mm") || "00:00",
        venue: values.venue || "",
      };
      await createMatch(formData, matchday?.number || 1);
      setMatchModalOpen(false);
      matchForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenMatchModal = () => {
    if (matchday?.date) {
      matchForm.setFieldsValue({ date: dayjs(matchday.date.toDate()) });
    }
    setMatchModalOpen(true);
  };

  const hasChanges = Object.keys(scores).length > 0;

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/admin">Admin</Link> },
          { title: <Link to="/admin/tournaments">Torneos</Link> },
          {
            title: (
              <Link to={`/admin/tournaments/${tournamentId}/matchdays`}>
                {tournament?.name || "Torneo"}
              </Link>
            ),
          },
          { title: matchday?.label || "Jornada" },
        ]}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate(`/admin/tournaments/${tournamentId}/matchdays`)
            }
          />
          <Title level={4} style={{ margin: 0 }}>
            {matchday?.label || "Resultados"}
          </Title>
        </Space>
        <Space>
          <Button icon={<PlusOutlined />} onClick={handleOpenMatchModal}>
            Nuevo Partido
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={saving}
            disabled={!hasChanges}
          >
            Guardar Todos
          </Button>
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "48px auto" }} />
      ) : matches.length === 0 ? (
        <EmptyState
          description="No hay partidos en esta jornada"
          actionLabel="Crear Partido"
          onAction={handleOpenMatchModal}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {matches.map((match) => (
            <Col xs={24} md={12} key={match.id}>
              <Card
                size="small"
                extra={
                  <Space size={8}>
                    <Button
                      size="small"
                      icon={<BarChartOutlined />}
                      onClick={() => setStatsMatch(match)}
                    >
                      Stats
                    </Button>
                    {match.status === "completed" ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Registrado
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="processing">
                        Pendiente
                      </Tag>
                    )}
                  </Space>
                }
                title={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {match.venue} - {match.time}
                  </Text>
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <Space>
                      <Text strong style={{ fontSize: 14 }}>
                        {match.homeTeamName}
                      </Text>
                      <Avatar src={match.homeTeamLogo} size="small">
                        {match.homeTeamName?.charAt(0)}
                      </Avatar>
                    </Space>
                  </div>
                  <InputNumber
                    className="score-input"
                    min={0}
                    value={getScore(match, "home")}
                    onChange={(v) => setMatchScore(match.id, "home", v)}
                    style={{ width: 64 }}
                    controls={false}
                  />
                  <Text strong style={{ fontSize: 20 }}>
                    :
                  </Text>
                  <InputNumber
                    className="score-input"
                    min={0}
                    value={getScore(match, "away")}
                    onChange={(v) => setMatchScore(match.id, "away", v)}
                    style={{ width: 64 }}
                    controls={false}
                  />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <Space>
                      <Avatar src={match.awayTeamLogo} size="small">
                        {match.awayTeamName?.charAt(0)}
                      </Avatar>
                      <Text strong style={{ fontSize: 14 }}>
                        {match.awayTeamName}
                      </Text>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={`Estadísticas — ${statsMatch?.homeTeamName} vs ${statsMatch?.awayTeamName}`}
        open={!!statsMatch}
        onCancel={() => setStatsMatch(null)}
        footer={null}
        width={1100}
        destroyOnClose
      >
        {statsMatch && tournamentId && (
          <StatsModalContent
            tournamentId={tournamentId}
            match={statsMatch}
            players={players}
            onClose={() => setStatsMatch(null)}
          />
        )}
      </Modal>

      <Modal
        title="Nuevo Partido"
        open={matchModalOpen}
        onOk={handleCreateMatch}
        onCancel={() => setMatchModalOpen(false)}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={matchForm} layout="vertical">
          <Form.Item
            name="homeTeamId"
            label="Equipo Local"
            rules={[{ required: true, message: "Requerido" }]}
          >
            <Select
              placeholder="Seleccionar"
              options={tournamentTeams.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="awayTeamId"
            label="Equipo Visitante"
            rules={[{ required: true, message: "Requerido" }]}
          >
            <Select
              placeholder="Seleccionar"
              options={tournamentTeams.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>
          <Space style={{ width: "100%" }}>
            <Form.Item
              name="date"
              label="Fecha"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="time" label="Hora" style={{ flex: 1 }}>
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item name="venue" label="Cancha">
            <Input placeholder="Ej: Cancha Principal" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchResultsPage;
