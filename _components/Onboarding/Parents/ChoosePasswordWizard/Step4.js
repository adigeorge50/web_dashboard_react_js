import React from 'react'

// Antd
import { Icon } from 'antd'
import { Spin } from 'antd'
import { Form, Input, message } from 'antd'
const FormItem = Form.Item

// Networking
import axios from 'axios'
import API_URLS from '../../../../_data/api_urls';

// Messages
import MESSAGES from '../../../../_data/messages'

import APP_IMAGE from "../../../../img/app.jpg"

import APPLE_STORE_STICKER from "../../../../img/apple_store_sticker.png"
import GOOGLE_PLAY_STICKER from "../../../../img/google_play_sticker.png"

export default class Comp extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            loadingMessage: "Accepting the invitation"
        }
    }

    componentDidMount() {
        this.props._changeLoading(4, true)

        let { formData, invitationID } = this.props;
        const {childId} = formData;
        axios.post(API_URLS.classroomInvitation.accept(invitationID), {
            ...childId && ({"studentId": childId}),
            "newStudentFirstName": formData.newStudentFirstName,
            "newStudentLastName": formData.newStudentLastName,
            "parent": {
                "firstName": formData.firstName,
                "lastName": formData.lastName,
                "cellPhone": formData.cellPhone,
                "relationship": formData.relationship
            }
        }, {
            headers: {
                "Authorization": `Bearer ${this.props.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
                isLoading: false
            })

            message.success(MESSAGES.success.accept)
            localStorage.removeItem('invitationID');
            this.props._changeLoading(4, false)
        }.bind(this))
        .catch(function (error) {
            console.log(error)
            this.setState({
                ...this.state,
                isLoading: false
            })
            localStorage.removeItem('invitationID');
            message.error(MESSAGES.error.default)

            this.props._changeLoading(4, false)
        }.bind(this))
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()

        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    render() {
        const { loadingMessage, isLoading } = this.state

        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <div style={{ textAlign: "center" }}>
                    <h3 style={{ marginTop: 15 }}>Download the At School Today App!</h3>
                    <img src={APP_IMAGE} style={{ maxWidth: 300 }} />

                    <p style={{ maxWidth: 400, margin: "auto", marginBottom: 15 }}>A customizable app free for your class or school. With notifications, auto-fill permission forms and easy payments.</p>

                    <div>
                        <img src={APPLE_STORE_STICKER} style={{ maxWidth: 159 }} />
                        <img src={GOOGLE_PLAY_STICKER} style={{ maxWidth: 200 }} />
                    </div>
                </div>
            </Spin>
        )
    }
}
