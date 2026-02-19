import React, { useState } from 'react';
import { Button, Space, Typography, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, Popconfirm, Breadcrumb } from 'antd';
import { AdminTable } from '../../shared/components/AdminTable';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMatchdays } from '../../features/matches/hooks/useMatchdays';
import { useTournaments } from '../../features/tournaments/hooks/useTournaments';
import type { Matchday, MatchdayFormValues } from '../../features/matches/types/match.types';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const statusColors: Record<string, string> = { upcoming: 'blue', in_progress: 'orange', completed: 'green' };
const statusLabels: Record<string, string> = { upcoming: 'Proxima', in_progress: 'En Curso', completed: 'Completada' };

const MatchdaysPage: React.FC = () => {
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matchdays, loading, createMatchday, updateMatchday, deleteMatchday } = useMatchdays(tournamentId);
  const { tournaments } = useTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMd, setEditingMd] = useState<Matchday | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingMd(null);
    form.resetFields();
    const nextNumber = matchdays.length + 1;
    form.setFieldsValue({ number: nextNumber, label: `Jornada ${nextNumber}`, status: 'upcoming' });
    setModalOpen(true);
  };

  const handleOpenEdit = (md: Matchday) => {
    setEditingMd(md);
    form.setFieldsValue({ number: md.number, label: md.label, date: dayjs(md.date.toDate()), status: md.status });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const data: MatchdayFormValues = { number: values.number, label: values.label, date: values.date.toISOString(), status: values.status };
      if (editingMd) {
        await updateMatchday(editingMd.id, data);
      } else {
        await createMatchday(data);
      }
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!tournamentId) return <LoadingSpinner />;

  const columns: ColumnsType<Matchday> = [
    { title: '#', dataIndex: 'number', key: 'number', width: 60 },
    { title: 'Jornada', dataIndex: 'label', key: 'label' },
    { title: 'Fecha', dataIndex: 'date', key: 'date', render: (d: { toDate?: () => Date }) => d?.toDate ? dayjs(d.toDate()).format('DD/MM/YYYY') : '-' },
    { title: 'Partidos', dataIndex: 'matchCount', key: 'matchCount', width: 80, align: 'center' },
    { title: 'Estado', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    {
      title: 'Acciones', key: 'actions', width: 200,
      render: (_: unknown, record: Matchday) => (
        <Space>
          <Button type="link" icon={<FileTextOutlined />} onClick={() => navigate(`/admin/tournaments/${tournamentId}/matchdays/${record.id}/results`)}>Resultados</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm title="Eliminar jornada" onConfirm={() => deleteMatchday(record.id)} okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <Link to="/admin">Admin</Link> },
        { title: <Link to="/admin/tournaments">Torneos</Link> },
        { title: tournament?.name || 'Torneo' },
        { title: 'Jornadas' },
      ]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/tournaments')} />
          <Title level={4} style={{ margin: 0 }}>Jornadas - {tournament?.name}</Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Nueva Jornada</Button>
      </div>

      <AdminTable columns={columns} dataSource={matchdays} loading={loading} />

      <Modal title={editingMd ? 'Editar Jornada' : 'Nueva Jornada'} open={modalOpen} onOk={handleSubmit}
        onCancel={() => setModalOpen(false)} confirmLoading={saving} okText={editingMd ? 'Guardar' : 'Crear'} cancelText="Cancelar">
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }}>
            <Form.Item name="number" label="Numero" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="Estado" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={[
                { value: 'upcoming', label: 'Proxima' },
                { value: 'in_progress', label: 'En Curso' },
                { value: 'completed', label: 'Completada' },
              ]} />
            </Form.Item>
          </Space>
          <Form.Item name="label" label="Etiqueta" rules={[{ required: true }]}>
            <Input placeholder="Ej: Jornada 1" />
          </Form.Item>
          <Form.Item name="date" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchdaysPage;
