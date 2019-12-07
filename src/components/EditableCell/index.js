/**
 * 表格的可编辑单元格（暂时只适用于 RowEditableTable 行编辑表格）
 * Table's editable cell (Only For Row Editable Table)
 *
 * 现在支持的类型为：输入框/数字输入/选择器/图片上传
 * Support type is: Input/Number/Select/Upload
 *
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, InputNumber, Form, Select, Upload, message, Icon } from 'antd';
import { getBase64 } from '@/utils/utils';

export const EditableContext = React.createContext('editCell');

// const EditableRow = ({ form, index, ...props }) => (
//   <EditableContext.Provider value={form}>
//     <tr {...props} />
//   </EditableContext.Provider>
// );

// export const EditableFormRow = Form.create()(EditableRow);

export class EditableCell extends Component {
  static defaultProps = {
    editing: false,
    inputType: '', // 编辑框类型默认为Input
    validatorRules: [],
    isRequired: false,
    options: undefined,
    inputNodeProps: {},
  };

  static propTypes = {
    editing: PropTypes.bool,

    // 编辑框类型，默认为Input
    inputType: PropTypes.oneOf(['number', 'select', 'upload-avatar', 'number', '']),

    // 编辑器类型为Select时需要, 加载Select.Option
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),

    // 编辑器特定可指定props
    inputNodeProps: PropTypes.object,

    // 校验条件, 不需isRequired, 也可以覆盖组件的 {isRequired, message}
    validatorRules: PropTypes.array,

    isRequired: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      imageUrl: 'a',
    };
  }

  save = () => {
    const { type, saveOnblur } = this.props;
    if (type === 'row' && !saveOnblur) {
      return;
    }

    console.log(this.props);
  };

  /**
   *
   */
  beforeUpload = file => {
    // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    // if (!isJpgOrPng) {
    //   message.error('You can only upload JPG/PNG file!');
    // }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    // return isJpgOrPng && isLt2M;
    return isLt2M;
  };

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj).then(imageUrl => {
        this.setState({
          imageUrl,
          loading: false,
        });
      });
    }
  };

  /**
   * 根据类型渲染元素，支持 输入框/数字/下拉选择/单图上传
   * 默认为Input
   */
  getInputNodeByType = (form) => {
    const { inputType, inputNodeProps, options = [], record, text } = this.props;
    const { imageUrl, loading } = this.state;
    let optionList = [];

    switch (inputType) {
      case 'number':
        return <InputNumber {...inputNodeProps} onBlur={this.save} />;
      case 'select':
        if (typeof options === 'function') {
          optionList = options(text, record, form);
        } else if (Array.isArray(options)) {
          optionList = options;
        }
        return (
          <Select {...inputNodeProps}>
            {optionList.map(item => (
              <Select.Option value={item.key} key={item.key}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'upload-avatar':
        return (
          <Upload
            {...inputNodeProps}
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="/"
            beforeUpload={this.beforeUpload}
            onChange={this.handleUploadChange}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                <Icon type={loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
              </div>
            )}
          </Upload>
        );
      default:
        return <Input {...inputNodeProps} />;
    }
  };

  getContextByType = children => {
    const { inputType, inputNodeProps, options = [], record } = this.props;
    // console.log(children);
  };

  renderCell = form => {
    const {
      editing,
      dataIndex,
      title,
      record,
      children,
      validatorRules = [],
      isRequired,
      // ...restProps
    } = this.props;
    const { getFieldDecorator } = form;
    
    // this.getContextByType(children);

    return (
      <td>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: isRequired,
                  message: `Please Input ${title}!`,
                },
                ...validatorRules,
              ],
              initialValue: record[dataIndex],
              validateFirst: true,
            })(this.getInputNodeByType(form))}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}
