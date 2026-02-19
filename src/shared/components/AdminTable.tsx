import { Table } from 'antd';
import type { TableProps } from 'antd';

export function AdminTable<T extends object>(props: TableProps<T>) {
  return (
    <Table<T>
      rowKey="id"
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 600 }}
      {...props}
      className={['admin-table', props.className].filter(Boolean).join(' ')}
    />
  );
}
