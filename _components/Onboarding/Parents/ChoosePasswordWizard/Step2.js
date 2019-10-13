import React from 'react'

// Antd
import { Icon, InputNumber } from 'antd'
import { Spin } from 'antd'
import { Form, Input, message } from 'antd'
const FormItem = Form.Item;
import InputMask from 'react-input-mask';

// Networking
import axios from 'axios'
import API_URLS from '../../../../_data/api_urls'

// Messages
import MESSAGES from '../../../../_data/messages'

import { parseQueryString } from "../../../../_utils/index"

class NormalLoginForm extends React.Component {
    render() {
      const { getFieldDecorator } = this.props.form
      // const queryParams = parseQueryString()

      return (
          <div className="form-centered">
              <Form className="login-form" style={{ margin: "auto", marginTop: "20px" }}>
                  <h3 style={{ maxWidth: 320, margin: "auto", lineHeight: "30px", marginBottom: 10 }}>
                    Does your information appear correctly?
                  </h3>

                  <p>If not change it and continue</p>

                  <FormItem label="First Name">
                      {getFieldDecorator('firstName', {
                          rules: [{ required: true, message: 'Please input your first name!' }],
                      })(
                          <Input placeholder="John" />
                      )}
                  </FormItem>

                  <FormItem label="Last Name">
                      {getFieldDecorator('lastName', {
                          rules: [{ required: true, message: 'Please input your last name!' }],
                      })(
                          <Input placeholder="Smith" />
                      )}
                  </FormItem>

                  <FormItem label="Relationship to student">
                      {getFieldDecorator('relationship', {
                          rules: [{ required: true, message: 'Please input your relationship!' }],
                      })(
                          <Input placeholder="Mother" />
                      )}
                  </FormItem>
                  <FormItem label="Cell-Phone Number">
                      {getFieldDecorator('cellPhone', {
                          rules: [
                            {   
                                pattern: new RegExp(/^\(\d{3}\)\s{1}\d{3}\-\d{4}$/), 
                                message: 'Phone number is not formatted correctly, format is: (XXX) XXX-XXXX'
                            },
                            { required: true, message: 'Please input your phone number!' }
                          ],
                      })(
                        <InputMask mask="(999) 999-9999"  className="ant-input"/>
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
        const { invitationID, formData } = this.props;
        const {firstName: newStudentFirstName, lastName: newStudentLastName, childId} = parseQueryString();
        if (Object.keys(formData).length > 0) {
            this.formComponent.setFieldsValue({
                "firstName": formData.firstName.trim(),
                "lastName": formData.lastName.trim(),
                "relationship": formData.relationship,
                "cellPhone": formData.cellPhone
            })
        } else {
            this.props._changeLoading(2, true)

            axios.get(API_URLS.classroomInvitation.details(invitationID), {
                headers: {
                    "Authorization": `Bearer ${this.props.authToken}`
                }
            })
            .then(response => {
                this.setState({
                    ...this.state,
                    isLoading: false,
                    details: response.data
                })

                let { data } = response;
                data = {...data, 
                    parentFirstName: data.parentFirstName.trim(),
                    parentLastName: data.parentLastName.trim()
                }
                this.formComponent.setFieldsValue({
                    "firstName": data.parentFirstName.trim(),
                    "lastName": data.parentLastName.trim()
                })
                if (!newStudentFirstName) {
                    this.props.updateFormData({
                        "newStudentFirstName": data.studentFirstName.trim(),
                        "newStudentLastName": data.studentLastName.trim(),
                        studentName: data.studentFirstName + " " + data.studentLastName,
                    });
                } else {
                    this.props.updateFormData({
                        newStudentFirstName: newStudentFirstName.trim(),
                        newStudentLastName: newStudentLastName.trim(),
                        childId,
                        studentName: `${newStudentFirstName.trim()} ${newStudentLastName.trim()}`,
                    });
                }

                this.props._changeLoading(2, false)
            })
            .catch(error => {
                console.log(error)

                this.setState({
                    ...this.state,
                    isLoading: false
                })

                message.error(MESSAGES.error.default)

                this.props._changeLoading(2, false)
            })
        }
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()

        return new Promise((resolve, reject) => {
            this.formComponent.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    this.props.updateFormData(values)

                    resolve(true)
                }
            })
        })
      }

      render() {
        const { loadingMessage, isLoading } = this.state

        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <FormComponent ref={formComponent => this.formComponent = formComponent} />
            </Spin>
        )
      }
  }
