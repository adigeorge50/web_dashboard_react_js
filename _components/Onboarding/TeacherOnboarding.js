// React-related
import React from 'react'

import { Redirect } from "react-router-dom"

import { EurekaForm } from 'react-eureka'

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'
import MESSAGES from "../../_data/messages"

// Antd
import { message, Spin } from 'antd'

class TeacherOnboarding extends React.Component {
    constructor(props) {
        super(props);
     
        this.state = {
            values: {},
            formSubmitted: false,
            isLoading: false,
            loadingMessage: ""
        }
    }

    _onSubmit = () => {
        const { values } = this.state
        const body = {
            "firstName": values.firstName,
            "lastName": values.lastName,
            "email": values.email,
            "password": values.password,
            "confirmPassword": values.password
        }

        this.setState({
            ...this.state,
            isLoading: true,
            loadingMessage: "Submitting Records"
        })

        axios.post(API_URLS.accounts.register, body, {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            }
        })
        .then(response => {
            this.setState({
                ...this.state,
                isLoading: false,
                formSubmitted: true
            })

            message.success(MESSAGES.success.register)
        })
        .catch(error => {
            console.log(error)

            this.setState({
                ...this.state,
                isLoading: false
            })

            message.error(MESSAGES.error.default)
        })
    }

    checkIfEmailExists = (email, state) => {
        this.setState({
            ...this.state,
            isLoading: true,
            loadingMessage: "Checking if email exists"
        })

        axios.head(API_URLS.classroomInvitation.emailExists(email), {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
                isLoading: false
            })

            message.success("You already have an account, please login")

            this.props.history.push(`/?email=${email}`)
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            console.log("SET STATE")

            this.setState({
                ...state,
                isLoading: false
            })
        }.bind(this))
    }
     
    render() {
        const { isLoading, loadingMessage, formSubmitted, values } = this.state

        return (
            <div className="container marginTop-30">
                <Spin spinning={isLoading} tip={loadingMessage}>
                    {!formSubmitted &&
                        <EurekaForm autoFocus
                            onSubmit={this._onSubmit}
                            onUpdate={(state) => {
                                if (this.state.values.email !== state.values.email) {
                                    this.checkIfEmailExists(state.values.email, state)
                                } else {
                                    this.setState(state)
                                }
                            }}>
                            <span type='firstName'>
                                What's your first name?
                            </span>

                            <span type='lastName'>
                                Hello <b>{values.firstName}</b>, and your last name?
                            </span>

                            <span type='email'>
                                What is your email?
                            </span>

                            <span type='password'>
                                Create a password (min. 8 characters)
                            </span>
                        </EurekaForm>
                    }

                    {formSubmitted &&
                        <Redirect to={`/?email=${values.email}`} />
                    }
                </Spin>
            </div>
        )
    }
}

export default TeacherOnboarding