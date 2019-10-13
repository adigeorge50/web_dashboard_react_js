import React from 'react'

// Antd
import { Icon } from 'antd'
import { Spin } from 'antd'
import { Form, Input, message } from 'antd'
const FormItem = Form.Item;

// Networking
import axios from 'axios'
import API_URLS from '../../../../_data/api_urls'

// Messages
import MESSAGES from '../../../../_data/messages'

import { parseQueryString } from "../../../../_utils/index"

import { updateAuth } from "../../../../__actions/auth";
class NormalLoginForm extends React.Component {
    compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      form.validateFields(['password'], {force: true});
      if (value && value !== form.getFieldValue('password')) {
        callback('Passwords that you enter is not equal!');
      } else {
          callback();
      }
    }
    compareToLastPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && value !== form.getFieldValue('confirm')) {
        callback('Passwords that you enter is not equal!');
      } else {
        callback();
      }
    }
    render() {
      const { getFieldDecorator } = this.props.form
      const queryParams = parseQueryString()

      return (
          <div style={{ textAlign: "center" }}>
              <Form className="login-form" style={{ margin: "auto", marginTop: "20px" }}>
                  <h3 style={{ margin: 0 }}>Welcome {queryParams.name}</h3>
                  <p>Create a password</p>

                  <FormItem>
                      {getFieldDecorator('password', {
                          rules: [
                            { required: true, message: 'Password must be 8 or more symbols!', min: 8 },
                            { validator: this.compareToLastPassword}
                          ],
                      })(
                          <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                      )}
                  </FormItem>
                  <FormItem>
                      {getFieldDecorator('confirm', {
                          rules: [
                            { required: true, message: 'Please confirm your password!', min: 8 }, 
                            { validator: this.compareToFirstPassword}],
                      })(
                          <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Confirm password" />
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
        isLoading: false
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()

        // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyYXNvdWwuaGFtaWRpYW5AZ21haWwuY29tIiwianRpIjoiNGExZGY2MjctZmZjZC00Y2ZhLWE4ZDgtZGMyODlhOTI2Nzk1IiwiaWF0IjoxNTM3Mjg2NzQzLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoicmFzb3VsLmhhbWlkaWFuQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6IjE0NDNjNDZmLWMzNjEtNDBlNC05YmMxLTdkOGM1OGZjM2YzZSIsInJvbCI6ImFwaV9hY2Nlc3MiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9naXZlbm5hbWUiOiJFbCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N1cm5hbWUiOiJNbyIsIm5iZiI6MTUzNzI4Njc0MywiZXhwIjoxNTM4MDA2NzQzLCJpc3MiOiJBU1QgVG9rZW4gSXNzdWVyIiwiYXVkIjoiQVNUIFVTRVIifQ.BP7-yet7EWzYRuw2tRHYJHIiiP1zxMgoNjxP703Hmd8"

        return new Promise((resolve, reject) => {
            this.formComponent.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    this.setState({
                        ...this.state,
                        isLoading: true,
                        loadingMessage: "Saving password"
                    })
                    // setTimeout(_ => resolve(true), 1000)
                    const { invitationID, newParentId } = this.props;
                    if (invitationID) {
                      axios.post(API_URLS.classroomInvitation.register(invitationID), {
                        password: values.password
                      }, {
                          headers: {
                            "Authorization": `Bearer ${this.props.authToken}`
                          }
                      })
                      .then(response => {
                        this.setState({
                          ...this.state,
                          isLoading: false,
                          loadingMessage: "Logging you in"
                        });

                        localStorage.setItem('invitationID', invitationID);

                          message.success(MESSAGES.success.passCreated);
                          const {email, name} = parseQueryString();
                          setTimeout(() => {
                            window.location = `/?email=${email}&name=${name}`;
                          }, 3000);
                          return resolve(true)
                      })
                      .catch(error => {
                          this.setState({
                              ...this.state,
                              isLoading: false
                          })

                          message.error(MESSAGES.error.default)
                      })
                    } else {
                      axios.post(API_URLS.accounts.setParentPassword, {
                        id: newParentId,
                        password: values.password,
                      }, {
                          headers: {
                            "Authorization": `Bearer ${this.props.authToken}`
                          }
                      })
                      .then(() => {
                        this.setState({isLoading: false});
                        setTimeout(() => {
                          window.location = '/';
                        }, 3000);
                        message.success(MESSAGES.success.passCreated);
                      })
                      .catch(() =>{
                        this.setState({
                          isLoading: false
                        })

                        message.error(MESSAGES.error.default)
                      })
                    }
                }
            })
        })
      }

      render() {
        const { loadingMessage, isLoading } = this.state;
        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <FormComponent ref={formComponent => this.formComponent = formComponent} />
            </Spin>
        )
      }
  }
