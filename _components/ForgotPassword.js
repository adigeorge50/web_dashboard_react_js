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

import { parseQueryString } from "../_utils"


// import { Form, Icon, Input, Button, Checkbox } from 'antd';

// const FormItem = Form.Item;

class ForgotPassword extends React.Component {
  state = {
      isLoading: false
  }
  
  handleSubmit = (e) => {
	e.preventDefault()
	
	const { form } = this.props
	const { email } = form.getFieldsValue(["email"])

    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)

        this.setState({
            ...this.state,
            isLoading: true
        })

        axios.post(API_URLS.accounts.forgotPassword, {
			email
		}, {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
				isLoading: false,
				success: true
            })

            message.success("Thanks, please check your email!")
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

  render() {
    const { isLoading, success } = this.state
    const { getFieldDecorator } = this.props.form

	if (success) return (
		<Redirect to="/" />
	)
	else return (
        <div className="container">
            <Form onSubmit={this.handleSubmit} className="login-form" style={{ marginTop: "15px" }}>
                <h3 style={{ margin: 0 }}>Forgot password</h3>
                <p>Please enter your email address</p>

				<FormItem>
                    {getFieldDecorator('email', {
                        rules: [{ required: true, message: 'Please input your email address!' }],
                    })(
                        <Input type="text" placeholder="Email Address" />
                    )}
                </FormItem>

                <Button type="primary" htmlType="submit" className="login-form-button" disabled={isLoading}>
                    Submit
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
    )(Form.create()(ForgotPassword))
