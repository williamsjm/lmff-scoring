import React, { useState } from "react";
import {
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  ColorPicker,
  Upload,
  Tag,
  Popconfirm,
  Avatar,
  Switch,
} from "antd";
import { AdminTable } from "../../shared/components/AdminTable";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTeams } from "../../features/teams/hooks/useTeams";
import type {
  Team,
  TeamFormValues,
} from "../../features/teams/types/team.types";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload";

const { Title } = Typography;

const TeamsPage: React.FC = () => {
  const { teams, loading, createTeam, updateTeam, deleteTeam } = useTeams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditingTeam(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, color: "#1B3C73" });
    setFileList([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    form.setFieldsValue({
      name: team.name,
      color: team.color,
      isActive: team.isActive,
    });
    setFileList([]);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSaving(true);
      const colorValue =
        typeof values.color === "string"
          ? values.color
          : typeof values.color?.toHexString === "function"
            ? values.color.toHexString()
            : "#1B3C73";
      const formData: TeamFormValues = {
        name: values.name,
        color: colorValue,
        isActive: values.isActive,
      };
      const logoFile = fileList[0]?.originFileObj as File | undefined;

      if (editingTeam) {
        await updateTeam(editingTeam.id, formData, logoFile);
      } else {
        await createTeam(formData, logoFile);
      }
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Team> = [
    {
      title: "Equipo",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Team) => (
        <Space>
          <Avatar
            src={record.logo}
            style={{ backgroundColor: record.color }}
            size="small"
          >
            {name.charAt(0)}
          </Avatar>
          {name}
        </Space>
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 110,
      render: (color: string) => (
        <Space size={8}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <span className="admin-table-mono" style={{ fontSize: 12 }}>{color}</span>
        </Space>
      ),
    },
    {
      title: "Jugadores",
      dataIndex: "playerCount",
      key: "playerCount",
      width: 100,
      align: "center",
      render: (count: number) => (
        <span className="admin-table-mono">{count ?? 0}</span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      align: "right",
      render: (_: unknown, record: Team) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#999999' }} />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Eliminar equipo"
            description="Esta accion no se puede deshacer"
            onConfirm={() => deleteTeam(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined style={{ color: '#999999' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
        <Title level={4} style={{ margin: 0 }}>
          Equipos
        </Title>
        <Space>
          <Input
            placeholder="Buscar equipo..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Nuevo Equipo
          </Button>
        </Space>
      </div>

      <AdminTable
        columns={columns}
        dataSource={filteredTeams}
        loading={loading}
      />

      <Modal
        title={editingTeam ? "Editar Equipo" : "Nuevo Equipo"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText={editingTeam ? "Guardar" : "Crear"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre del equipo"
            rules={[{ required: true, message: "Ingresa el nombre" }]}
          >
            <Input placeholder="Ej: Halcones FC" />
          </Form.Item>
          <Form.Item name="color" label="Color del equipo">
            <ColorPicker />
          </Form.Item>
          <Form.Item label="Logo del equipo">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Subir logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="isActive" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamsPage;
