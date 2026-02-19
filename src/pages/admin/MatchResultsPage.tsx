import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
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

interface ScoreState {
  [matchId: string]: { homeScore: number | null; awayScore: number | null };
}

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
  const [matchForm] = Form.useForm();
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
                  match.status === "completed" ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Registrado
                    </Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} color="processing">
                      Pendiente
                    </Tag>
                  )
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
