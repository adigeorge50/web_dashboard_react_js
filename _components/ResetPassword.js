// React-related
import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    IndexRoute,
    Redirect
} from 'react-router-dom'
import PropTypes from 'prop-types'
import { instanceOf } from 'prop-types'
import { compose } from 'redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// Networking
import axios from 'axios'
import API_URLS from '../_data/api_urls'

import moment from 'moment'

// Antd
import { Button, Icon } from 'antd'
import { message } from 'antd'
import { Spin } from 'antd'
import { Form, Input } from 'antd'
const FormItem = Form.Item

// Messages
import MESSAGES from '../_data/messages'

// Misc
import ContentLayout from './ContentLayout'

import { parseQueryString } from "../_utils/index"


// import { Form, Icon, Input, Button, Checkbox } from 'antd';

// const FormItem = Form.Item;

class ResetPassword extends React.Component {
  state = {
      isLoading: false
  }
  
  handleSubmit = (e) => {
	e.preventDefault()
	
	const queryParams = parseQueryString()
	const { form } = this.props
	const { email, password, confirmPassword } = form.getFieldsValue(["email", "password", "confirmPassword"])

    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)

        this.setState({
            ...this.state,
            isLoading: true
        })

        axios.post(API_URLS.accounts.resetPassword, {
			email,
			password,
			confirmPassword,
			code: decodeURIComponent(queryParams.code)
		})
        .then(function (response) {
            this.setState({
                ...this.state,
				isLoading: false,
				success: true
            })

            message.success(MESSAGES.success.create)
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this.setState({
                ...this.state,
                isLoading: false
            })

            message.error(MESSAGES.error.default)
        }.bind(this))
      }
    })
  }

  validatePassword = (rule, value, callback) => {
    const { form } = this.props
    const formValues = form.getFieldsValue(["password", "confirmPassword"])
	const { field } = rule

	if (!formValues[field] || formValues[field].length === 0) {
		return callback("Please input password")
	}
	
	if (formValues.password && formValues.confirmPassword && formValues.password.length > 0 && formValues.confirmPassword.length > 0) {
		if (formValues.password != formValues.confirmPassword) return callback("Passwords not matching")
	}
	
	callback()
  }

  render() {
    const { isLoading, success } = this.state
    const { getFieldDecorator } = this.props.form

	if (success) return (
		<Redirect to="/" />
	)
	else return (
        <div className="container">
            <Form onSubmit={this.handleSubmit} className="login-form" style={{ marginTop: "15px" }}>
                <h3 style={{ margin: 0 }}>Select a New Password</h3>
                <p>Please choose a new password to move forward.</p>

				<FormItem>
                    {getFieldDecorator('email', {
                        rules: [{ required: true, message: 'Please input your email address!' }],
                    })(
                        <Input type="text" placeholder="Email Address" />
                    )}
                </FormItem>

                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ validator: this.validatePassword }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="New Password" />
                    )}
                </FormItem>

                <FormItem>
                    {getFieldDecorator('confirmPassword', {
                        rules: [{ validator: this.validatePassword }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Confirm Password" />
                    )}
                </FormItem>

                <Button type="primary" htmlType="submit" className="login-form-button" disabled={isLoading}>
                    Update
                </Button>
            </Form>
        </div>
    )
  }
}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Form.create()(ResetPassword))
