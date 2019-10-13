import React from 'react'

// Antd
import { InputNumber, Select } from 'antd'
import { Spin } from 'antd'
import { Form, Input, message } from 'antd'
const FormItem = Form.Item

// Networking
import axios from 'axios'
import API_URLS from '../../../../_data/api_urls'

// Messages
import MESSAGES from '../../../../_data/messages'

import { parseQueryString } from "../../../../_utils/index"

class NormalLoginForm extends React.Component {
    updateFormData = (e, name) => {
        const value = e.target ? e.target.value : e

        this.props.updateFormData({
            [name]: value
        })
    }

    render() {
      const { getFieldDecorator } = this.props.form
      const { formData } = this.props

      return (
          <div className="form-centered">
              <Form className="login-form" style={{ margin: "auto", marginTop: "20px" }}>
                  <h3 style={{ maxWidth: 320, lineHeight: "30px", marginBottom: 10 }}>
                    Create your first classroom!
                  </h3>

                  <FormItem label='Name'>
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: 'Please provide the name of the class',
                            }],
                        })(
                            <Input placeholder="English Class" />
                        )}
                    </FormItem>

                    <FormItem label='Grade'>
                        {getFieldDecorator('grade', {
                            rules: [{
                                required: true,
                                message: 'Please enter the grade in which the class is offered in',
                            }],
                        })(
                        <Select>
                          <Option value='JK'>JK</Option>
                          <Option value='SK'>SK</Option>
                          <Option value='1'>1</Option>
                          <Option value='2'>2</Option>
                          <Option value='3'>3</Option>
                          <Option value='4'>4</Option>
                          <Option value='5'>5</Option>
                          <Option value='6'>6</Option>
                          <Option value='7'>7</Option>
                          <Option value='8'>8</Option>
                          <Option value='9'>9</Option>
                          <Option value='10'>10</Option>
                          <Option value='11'>11</Option>
                          <Option value='12'>12</Option>
                        </Select>
                        )}
                    </FormItem>

                    <FormItem
                        label="School"
                        className="marginTop-15"
                    >
                        {getFieldDecorator('schoolID', {
                            rules: [
                                { required: true, message: 'Please choose a school' }
                            ]
                        })(
                            <Select
                                style={{ width: '80%', maxWidth: '200px' }}
                                onChange={value => this.updateFormData(value, "schoolID")}
                            >
                                {formData.schools.map((school, i) => (
                                    <Option key={`school-${i}`} value={school.id}>
                                        {school.name}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
              </Form>
          </div>
      )
    }
  }

  const FormComponent = Form.create()(NormalLoginForm)

  export default class Comp extends React.Component {
    state = {
        isLoading: false,
        loadingMessage: "Retrieving invitation"
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()

        return new Promise((resolve, reject) => {
            this.formComponent.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    this.setState({
                        ...this.state,
                        isLoading: true,
                        loadingMessage: "Saving Records"
                    })

                    axios.post(API_URLS.classroom.create, {
                        name: values.name,
                        grade: values.grade,
                        schoolId: values.schoolID
                    }, {
                        headers: {
                            "Authorization": `Bearer ${this.props.authToken}`
                        },
                    })
                    .then(function (response) {
                        this.setState({
                            ...this.state,
                            isLoading: false
                        })

                        this.props._changeLoading(2, false)

                        message.success(MESSAGES.success.create)

                        return resolve()
                    }.bind(this))
                    .catch(function (error) {
                        console.log(error)

                        message.error(MESSAGES.error.default)

                        this.setState({
                            ...this.state,
                            isLoading: false
                        })

                        this.props._changeLoading(2, false)
                    }.bind(this))
                }
            })
        })
      }

      render() {
        const { loadingMessage, isLoading } = this.state

        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <FormComponent
                    ref={formComponent => this.formComponent = formComponent}
                    updateFormData={this.props.updateFormData}
                    formData={this.props.formData}
                />
            </Spin>
        )
      }
  }
