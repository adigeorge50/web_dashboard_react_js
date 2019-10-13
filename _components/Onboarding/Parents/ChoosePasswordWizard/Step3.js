import React from 'react'

// Antd
import { Icon } from 'antd'
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
        const { value } = e.target

        this.props.updateFormData({
            [name]: value
        })
    }

    render() {
      const { getFieldDecorator } = this.props.form
      const { studentName } = this.props
      
      return (
          <div className="form-centered">
              <Form className="login-form" style={{ margin: "auto", marginTop: "20px" }}>
                  <h3 style={{ maxWidth: 320, margin: "auto", lineHeight: "30px", marginBottom: 10 }}>
                    Please verify the spelling for {studentName}
                  </h3>

                  <p>If wrong, please change it and continue</p>
  
                  <FormItem label="Student First Name">
                      {getFieldDecorator('firstName', {
                          rules: [{ required: true, message: 'Please input your first name!' }],
                      })(
                          <Input placeholder="John" onChange={e => this.updateFormData(e, "newStudentFirstName")} />
                      )}
                  </FormItem>

                  <FormItem label="Student Last Name">
                      {getFieldDecorator('lastName', {
                          rules: [{ required: true, message: 'Please input your first name!' }],
                      })(
                          <Input placeholder="Smith" onChange={e => this.updateFormData(e, "newStudentLastName")} />
                      )}
                  </FormItem>
              </Form>
          </div>
      )
    }
  }

  const FormComponent = Form.create()(NormalLoginForm)

  export default class Comp extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            isLoading: Object.keys(props.formData).length == 0,
            loadingMessage: "Retrieving invitation"
        }
    }

    componentDidMount() {
        const { formData } = this.props;
        this.formComponent.setFieldsValue({
            "firstName": formData.newStudentFirstName,
            "lastName": formData.newStudentLastName
        })
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()
        
        return new Promise((resolve, reject) => {
            this.formComponent.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    this.props.updateFormData({
                        newStudentFirstName: values.firstName,
                        newStudentLastName: values.lastName,
                        studentName: `${values.firstName} ${values.lastName}`
                    })

                    resolve(true)
                }
            })
        })
      }

      render() {
        const { loadingMessage, isLoading } = this.state
        const { updateFormData, studentName } = this.props

        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <FormComponent
                    ref={formComponent => this.formComponent = formComponent}
                    studentName={studentName}
                    updateFormData={updateFormData}
                />
            </Spin>
        )
      }
  }