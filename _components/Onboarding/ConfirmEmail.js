// React-related
import React from 'react'

import { Redirect } from "react-router-dom"

import { parseQueryString } from "../../_utils/index"

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'
import MESSAGES from "../../_data/messages"

// Antd
import { message, Spin } from 'antd'

class ConfirmEmail extends React.Component {
    constructor(props) {
        super(props);
     
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        const queryStrings = parseQueryString()
        axios.get(API_URLS.accounts.confirmEmail, {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            },
            params: {
                "userId": queryStrings.userId,
                "code": decodeURIComponent(queryStrings.code)
            }
        })
        .then(response => {
            this.setState({
                ...this.state,
                isLoading: false
            })

            message.success(MESSAGES.success.confirm)

            this.props.history.push("/")
        })
        .catch(error => {
            console.log(error)

            this.setState({
                ...this.state,
                isLoading: false
            })

            message.error(MESSAGES.error.default)

            this.props.history.push("/")
        })
    }
     
    render() {
        const { isLoading } = this.state

        return (
            <div className="container marginTop-30" style={{ textAlign: "center" }}>
                <Spin spinning={isLoading} tip="Processing" />
            </div>
        )
    }
}

export default ConfirmEmail
