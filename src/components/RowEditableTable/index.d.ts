import React from 'react';

export default class RowEditableTable extends React.Component<TableProps, {}> {
  addible: boolean; // 添加行 按钮
  editable: boolean; // 可编辑
  deletable: boolean; // 可删除
  checkable: boolean; // 可选择
  rowKey: string;
  columns: Array; // 见Table/Colum 及../EditableCell
  dataSource: Array[any];
  updateDataSource: (key: string | number, value: any) => void;
  updateEditingKey: (key: string | number) => void;
  addRow: Function;
  deleteRow: (key: string | number) => void;
  onRowSelectChange: (selectedRowKeys: Array<number | string>, selectedRow: any) => void;
}
