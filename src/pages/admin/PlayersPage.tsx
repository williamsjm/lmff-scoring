import React, { useState } from 'react';
import { Table, Button, Space, Typography, Select, Modal, Form, Input, InputNumber, Tag, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePlayers } from '../../features/players/hooks/usePlayers';
import { useTeams } from '../../features/teams/hooks/useTeams';
import type { Player, PlayerFormValues } from '../../features/players/types/player.types';
import { POSITION_OPTIONS } from '../../features/players/types/player.types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const PlayersPage: React.FC = () => {
  const [filterTeamId, setFilterTeamId] = useState<string | undefined>(undefined);
  const { players, loading, createPlayer, updatePlayer, deletePlayer } = usePlayers(filterTeamId);
  const { teams } = useTeams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingPlayer(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    form.setFieldsValue({
      name: player.name, number: player.number, position: player.position,
      teamId: player.teamId, active: player.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const team = teams.find(t => t.id === values.teamId);
      const formData: PlayerFormValues = {
        name: values.name, number: values.number, position: values.position,
        teamId: values.teamId, active: values.active,
      };
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, formData, team?.name);
      } else {
        await createPlayer(formData, team?.name || '');
      }
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Player> = [
    { title: '#', dataIndex: 'number', key: 'number', width: 60, align: 'center' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Posicion', dataIndex: 'position', key: 'position', width: 80, render: (pos: string) => <Tag>{pos}</Tag> },
    { title: 'Equipo', dataIndex: 'teamName', key: 'teamName' },
    { title: 'Estado', dataIndex: 'active', key: 'active', width: 90, render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Activo' : 'Inactivo'}</Tag> },
    {
      title: 'Acciones', key: 'actions', width: 120,
      render: (_: unknown, record: Player) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm title="Eliminar jugador" description="Esta accion no se puede deshacer"
            onConfirm={() => deletePlayer(record.id, record.teamId)} okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>Jugadores</Title>
        <Space>
          <Select placeholder="Filtrar por equipo" allowClear style={{ width: 200 }}
            value={filterTeamId} onChange={setFilterTeamId} options={teams.map(t => ({ value: t.id, label: t.name }))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Nuevo Jugador</Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={players} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} scroll={{ x: 600 }} />

      <Modal title={editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'} open={modalOpen} onOk={handleSubmit}
        onCancel={() => setModalOpen(false)} confirmLoading={saving} okText={editingPlayer ? 'Guardar' : 'Crear'} cancelText="Cancelar">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre completo" rules={[{ required: true, message: 'Requerido' }]}>
            <Input placeholder="Nombre del jugador" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="number" label="Numero" rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 1 }}>
              <InputNumber min={0} max={99} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="position" label="Posicion" rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 1 }}>
              <Select options={POSITION_OPTIONS} placeholder="Posicion" />
            </Form.Item>
          </Space>
          <Form.Item name="teamId" label="Equipo" rules={[{ required: true, message: 'Requerido' }]}>
            <Select placeholder="Seleccionar equipo" options={teams.map(t => ({ value: t.id, label: t.name }))} />
          </Form.Item>
          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlayersPage;
