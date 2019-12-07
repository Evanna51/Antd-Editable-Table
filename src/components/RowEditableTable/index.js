/**
 * 可编辑表格，默认允许编辑删除，添加和选择不打开
 * Table支持的参数中有特殊的：
 *    1. 传入的columns会进行二次封装，添加编辑/删除的操作列
 *    2. rowKey 只接受string
 *    3. 开启checkable后如果无特殊处理，不需要传入rowSelection，只需要onRowSelectChange
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Form, Divider, Button } from 'antd';
import { EditableCell, EditableContext } from '../EditableCell';

@Form.create()
class RowEditableTable extends Component {
  static defaultProps = {
    addible: false, // 添加行 按钮
    editable: true, // 可编辑
    deletable: true, // 可删除
    checkable: false, // 可选择
    updateDataSource: undefined,
    updateEditingKey: undefined,
    addRow: undefined,
    onRowSelectChange: undefined,
    deleteRow: undefined,
  };

  // 也可以手动传入antd Table允许的其他参数，比如 bordered, footer, loading, scroll
  // Also allow antd Table's others orginal props, like : bordered, footer, loading, scroll ... and so on.
  static propTypes = {
    addible: PropTypes.bool, // 添加行 按钮
    editable: PropTypes.bool, // 可编辑
    deletable: PropTypes.bool, // 可删除
    checkable: PropTypes.bool, // 可选择
    rowKey: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired, // 见Table/Colum 及../EditableCell
    dataSource: PropTypes.array.isRequired,
    updateDataSource: PropTypes.func,
    updateEditingKey: PropTypes.func,
    addRow: PropTypes.func,
    deleteRow: PropTypes.func,
    onRowSelectChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { editingKey: '' };
  }

  /**
   * 添加操作列，格式化
   */
  columnsCompose = ({ columns, editable, deletable, rowKey }) => {
    const myColumns = [...columns];
    myColumns.push({
      title: 'operation',
      dataIndex: 'operation',
      width: 140,
      render: (text, record) => {
        const { editingKey } = this.state;
        const isEditing = this.isEditing(record);
        let operations = null;
        // 编辑状态 显示[保存] [取消]，显示状态显示[编辑][删除]
        if (isEditing) {
          operations = (
            <>
              <EditableContext.Consumer>
                {form => (
                  <a onClick={() => this.save(form, record[rowKey])} style={{ marginRight: 8 }}>
                    Save
                  </a>
                )}
              </EditableContext.Consumer>
              <Divider type="vertical" />
              <a onClick={() => this.cancel(record[rowKey])} className="label-delete">
                Cancel
              </a>
            </>
          );
        } else {
          operations = (
            <>
              {editable && (
                <a disabled={editingKey !== ''} onClick={() => this.edit(record[rowKey])}>
                  Edit
                </a>
              )}
              {editable && deletable && <Divider type="vertical" />}
              {deletable && (
                <a
                  disabled={editingKey !== ''}
                  onClick={() => this.delete(record[rowKey])}
                  className="label-delete"
                >
                  delete
                </a>
              )}
            </>
          );
        }
        return operations;
      },
    });
    return myColumns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          ...col,
          record,
          editing: this.isEditing(record),
        }),
      };
    });
  };

  /**
   * 添加一行
   */
  onAddRow = () => {
    const { addRow } = this.props;
    if (addRow && typeof addRow === 'function') {
      addRow();
    }
  };

  /**
   * 判断编辑状态
   */
  isEditing = record => {
    const { editingKey } = this.state;
    const { rowKey } = this.props;

    return record[rowKey] === editingKey;
  };

  /**
   * 取消编辑
   * 父组件可能需要获取编辑状态
   */
  cancel = () => {
    this.setState({ editingKey: '' });
    const { updateEditingKey } = this.props;
    if (updateEditingKey && typeof updateEditingKey === 'function') {
      updateEditingKey('');
    }
  };

  /**
   * 开始编辑
   * @param {*} key
   */
  edit(key) {
    this.setState({ editingKey: key });
    const { updateEditingKey } = this.props;
    if (updateEditingKey && typeof updateEditingKey === 'function') {
      updateEditingKey(key);
    }
  }

  delete(key) {
    const { deleteRow } = this.props;
    if (deleteRow && typeof deleteRow === 'function') {
      deleteRow(key);
    }
  }

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const { updateDataSource } = this.props;
      if (updateDataSource && typeof updateDataSource === 'function') {
        updateDataSource(key, row);
      }
      this.cancel();
    });
  }

  render() {
    const {
      form,
      addible,
      editable,
      deletable,
      checkable,
      rowSelection: propsRowSelection,
      showPagination,
      columns,
      rowKey,
      onRowSelectChange,
      dataSource,
      addRow,
      ...restProps
    } = this.props;

    const columnsFull = this.columnsCompose({ columns, editable, deletable, rowKey });

    // 可选择
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        if (onRowSelectChange && typeof onRowSelectChange === 'function') {
          onRowSelectChange(selectedRowKeys, selectedRows);
        }
      },
      ...propsRowSelection,
      // getCheckboxProps: record => ({
      //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      //   name: record.name,
      // }),
    };

    return (
      <EditableContext.Provider value={form}>
        <Table
          columns={columnsFull}
          dataSource={dataSource}
          rowSelection={checkable && rowSelection}
          components={{ body: { cell: EditableCell } }}
          bordered
          rowKey={rowKey || 'key'}
          rowClassName="editable-row"
          pagination={
            showPagination
              ? {
                  onChange: this.cancel,
                }
              : false
          }
          {...restProps}
        />
        {addible && (
          <Button
            style={{ width: '100%', marginTop: 16, marginBottom: 8, color: '#0bb27a' }}
            type="dashed"
            onClick={this.onAddRow}
            icon="plus"
          >
            新增行
          </Button>
        )}
      </EditableContext.Provider>
    );
  }
}

export default RowEditableTable;
