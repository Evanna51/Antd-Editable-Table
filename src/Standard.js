import React, { Component } from "react";
import { Card } from "antd";
import RowEditableTable from "./components/RowEditableTable";

class ExamplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      candidates: []
    };
  }

  handleScoreChange = value => {
    this.setState({ candidates: value });
  };

  /**
   * 添加空行
   */
  addRow = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "exampleModal/addStandardRow"
    });
  };

  deleteRow = key => {
    const { dispatch } = this.props;
    dispatch({
      type: "exampleModal/deleteStandardRow",
      payload: { key }
    });
  };

  updateDataSource = (key, rowData) => {
    // console.log(key, rowData);
    const { dispatch } = this.props;
    dispatch({
      type: "exampleModal/updateStandardRow",
      payload: {
        key,
        rowData
      }
    });
  };

  /**
   * 校验是否为纯数字数组
   */
  isNumberArrayValidator = (rule, value, callback) => {
    if (value && value.length > 0) {
      for (let i = 0; i < value.length; i += 1) {
        const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        if (
          (!Number.isNaN(value[i]) && reg.test(value[i])) ||
          value[i] === "" ||
          value[i] === "-"
        ) {
          // callback();
        } else {
          callback(`${value[i]}不是一个数字！`);
        }
      }
    }
    callback();
  };

  /**
   * 校验已选项是否在列表中
   */
  hasOptionValidator = (rule, value, callback, form) => {
    const { candidates } = this.state;
    console.log(form);
    if (value && !candidates.includes(value)) {
      callback("请重新选择");
    }
    callback();
  };

  render() {
    const {
      exampleModal: { dataSource }
    } = this.props;

    const columns = [
      {
        title: `田径项目`,
        dataIndex: "project",
        width: 120,
        editable: true
      },
      {
        title: "年龄限制",
        width: 120,
        dataIndex: "ageRange",
        editable: true
      },
      {
        title: "入围选手",
        width: 120,
        dataIndex: "candidates",
        editable: true,
        precision: 4,
        inputType: "select",
        inputNodeProps: {
          mode: "tags",
          style: { width: "100%" },
          tokenSeparators: [";", "；"],
          onChange: this.handleScoreChange.bind(this)
        },
        options: [
          { key: "203", label: "202" },
          { key: "299", label: "299" }
        ],
        validatorRules: [{ validator: this.isNumberArrayValidator.bind(this) }],
        render: (text, record) => {
          return (
            <span>{text && Array.isArray(text) ? text.join(" ; ") : text}</span>
          );
        }
      },
      {
        width: 120,
        title: "获奖选手",
        dataIndex: "champion",
        editable: true,
        precision: 4,
        inputType: "select",
        inputNodeProps: {
          style: { width: "100%" }
        },
        options: (text, record, form) => {
          const candidates = form.getFieldValue("candidates") || [];
          return candidates.map(score => ({ key: score, label: score }));
        },
        validatorRules: [{ validator: this.hasOptionValidator.bind(this) }]
      }
    ];

    return (
      <Card title="Editable Table">
        <RowEditableTable
          columns={columns}
          dataSource={dataSource}
          rowKey="no"
          scroll={{ y: 600 }}
          addible
          editable
          deletable
          checkable
          addRow={this.addRow}
          deleteRow={this.deleteRow}
          updateEditingKey={this.updateEditingKey}
          updateDataSource={this.updateDataSource}
        />
      </Card>
    );
  }
}

export default ExamplePage;
