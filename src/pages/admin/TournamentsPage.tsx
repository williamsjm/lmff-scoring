import React, { useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Popconfirm, Transfer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTournaments } from '../../features/tournaments/hooks/useTournaments';
import { useTeams } from '../../features/teams/hooks/useTeams';
import type { Tournament, TournamentFormValues } from '../../features/tournaments/types/tournament.types';
import { FORMAT_OPTIONS, STATUS_OPTIONS } from '../../features/tournaments/types/tournament.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors: Record<string, string> = { upcoming: 'blue', active: 'green', finished: 'default' };

const TournamentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tournaments, loading, createTournament, updateTournament, deleteTournament } = useTournaments();
  const { teams } = useTeams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [form] = Form.useForm();
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingTournament(null);
    form.resetFields();
    form.setFieldsValue({ pointsWin: 3, pointsDraw: 1, pointsLoss: 0, status: 'upcoming', format: 'round_robin' });
    setSelectedTeamIds([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    form.setFieldsValue({
      name: tournament.name, format: tournament.format, status: tournament.status,
      pointsWin: tournament.pointsWin, pointsDraw: tournament.pointsDraw, pointsLoss: tournament.pointsLoss,
      dates: [dayjs(tournament.startDate.toDate()), dayjs(tournament.endDate.toDate())],
    });
    setSelectedTeamIds(tournament.teamIds || []);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const formData: TournamentFormValues = {
        name: values.name, format: values.format, status: values.status,
        teamIds: selectedTeamIds, pointsWin: values.pointsWin, pointsDraw: values.pointsDraw, pointsLoss: values.pointsLoss,
        startDate: values.dates[0].toISOString(), endDate: values.dates[1].toISOString(),
      };
      if (editingTournament) {
        await updateTournament(editingTournament.id, formData);
      } else {
        await createTournament(formData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Tournament> = [
    { title: 'Torneo', dataIndex: 'name', key: 'name' },
    { title: 'Formato', dataIndex: 'format', key: 'format', render: (f: string) => FORMAT_OPTIONS.find(o => o.value === f)?.label || f },
    { title: 'Estado', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{STATUS_OPTIONS.find(o => o.value === s)?.label || s}</Tag> },
    { title: 'Equipos', dataIndex: 'teamIds', key: 'teams', render: (ids: string[]) => ids?.length || 0, width: 80 },
    { title: 'Jornadas', dataIndex: 'matchdayCount', key: 'matchdays', width: 90 },
    {
      title: 'Acciones', key: 'actions', width: 160,
      render: (_: unknown, record: Tournament) => (
        <Space>
          <Button type="link" icon={<CalendarOutlined />} onClick={() => navigate(`/admin/tournaments/${record.id}/matchdays`)}>Jornadas</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm title="Eliminar torneo" description="Se eliminaran todas las jornadas y partidos"
            onConfirm={() => deleteTournament(record.id)} okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferData = teams.map(t => ({ key: t.id, title: t.name }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>Torneos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Nuevo Torneo</Button>
      </div>

      <Table columns={columns} dataSource={tournaments} rowKey="id" loading={loading} scroll={{ x: 700 }} />

      <Modal title={editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'} open={modalOpen} onOk={handleSubmit}
        onCancel={() => setModalOpen(false)} confirmLoading={saving} okText={editingTournament ? 'Guardar' : 'Crear'} cancelText="Cancelar" width={700}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre del torneo" rules={[{ required: true, message: 'Requerido' }]}>
            <Input placeholder="Ej: Temporada 2026" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="format" label="Formato" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={FORMAT_OPTIONS} />
            </Form.Item>
            <Form.Item name="status" label="Estado" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Space>
          <Form.Item name="dates" label="Fechas" rules={[{ required: true, message: 'Requerido' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="pointsWin" label="Pts Victoria" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="pointsDraw" label="Pts Empate" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="pointsLoss" label="Pts Derrota" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="Equipos participantes">
            <Transfer dataSource={transferData} targetKeys={selectedTeamIds}
              onChange={(keys) => setSelectedTeamIds(keys as string[])}
              render={item => item.title || ''} titles={['Disponibles', 'Seleccionados']} listStyle={{ width: '100%', height: 200 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TournamentsPage;
