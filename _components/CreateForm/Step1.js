import React from 'react'

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'

// Antd
import { Form, Popconfirm } from 'antd'
const FormItem = Form.Item
import { Radio, Input } from 'antd'
const RadioGroup = Radio.Group
import { Button, Icon } from 'antd'
import { Row, Col } from 'antd'
import { Spin } from 'antd'
import { Divider } from 'antd'
import { Select } from 'antd'
const Option = Select.Option


import PLACEHOLDER from '../../img/CreateForm/PreviewPlaceholder.svg'

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
}

class Step1 extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            templateID: null,
            formType: props.formData.formType
        }
    }

    componentDidMount() {
        this.props.form.setFieldsValue({
            "form-type": this.props.formData.formType,
            "form-pdf": this.props.formData.files
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.formData.formType !== this.state.formType) {
            this.props.form.setFieldsValue({
                "form-type": nextProps.formData.formType,
                "form-pdf": nextProps.formData.files
            })

            this.setState({
                ...this.state,
                formType: nextProps.formData.formType
            })
        }
    }

    _getFormTemplate(id) {
        axios.get(`${API_URLS.formTemplate.get}/${id}`, {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            }
        })
        .then(function (response) {
            console.log(response)

            this.setState({
                ...this.state,
                templateID: id
            })
            console.log(response.data);
            this.props._applyTemplate(response.data)
        }.bind(this))
        .catch(function (error) {
            console.log(error)
        })
    }

    deleteTemplate = id => {
      // delete here request
    }

    render() {
        const { isLoading, filePreview, formTemplates, formData, _handleFileChange } = this.props
            , { getFieldDecorator } = this.props.form
        const {templateID} = this.state;
        return (
            <Form>
                <Row>
                    <Col xs={24} md={12} lg={8}>

                        <FormItem
                            label="Please select type of Form:"
                        >
                            {getFieldDecorator('form-type', {
                                rules: [{ required: true, message: 'Please choose a value!' }],
                            })(
                                <RadioGroup
                                    onChange={(e) => this.props._handleFormChange("formType", e.target.value)}
                                >
                                    <Radio style={radioStyle} value={0}>Field Trip</Radio>
                                    <Radio style={radioStyle} value={1}>Standard</Radio>
                                    <Radio style={radioStyle} value={2}>Simple Note</Radio>
                                    <Radio style={radioStyle} value={3}>Fundraising</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="Select a PDF/template:"
                        >
                            <div className="file-upload-button">
                                <Button type="primary" size='large'>
                                    <Icon type="plus" />
                                    Upload New Form
                                </Button>


                                {getFieldDecorator('form-pdf', {
                                    rules: [{ required: formData.templateId === null && !filePreview, message: 'Please choose a file!' }],
                                })(
                                    <input
                                        name="img"
                                        type="file"
                                        onChange={(e) => _handleFileChange(e)}
                                    />
                                )}
                            </div>
                        </FormItem>
                      <Row>
                        <Select
                            placeholder="Or choose a template"
                            style={{ width: "75%" }}
                            onChange={this._getFormTemplate.bind(this)}
                            defaultValue={formData.templateId ? formData.templateId : undefined}
                        >
                            {formTemplates.map((template, index) =>
                                <Option key={`form-template-${index}`} value={template.id}>{template.name}</Option>
                            )}
                        </Select>
                        {templateID &&
                          <Popconfirm
                            placement="top"
                            title="Are you sure you want to permanently delete this template?"
                            onConfirm={() => this.deleteTemplate(templateID)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="default" style={{marginLeft: '16px'}}>
                              <Icon type="delete" />
                            </Button>
                          </Popconfirm>
                        }
                      </Row>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <div className="template-preview">
                            <Spin tip="Loading..." spinning={isLoading[1]}>
                                <img src={filePreview ? filePreview : PLACEHOLDER} />
                            </Spin>
                        </div>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create()(Step1)
