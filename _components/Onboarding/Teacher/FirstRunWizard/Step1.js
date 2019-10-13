import React, {Fragment} from 'react'

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

import { form as AddSchoolModal } from '../../../Classrooms/AddSchoolModal'

import TutorialModal from '../TutorialModal';

export default class Comp extends React.Component {
    state = {
        isLoading: false
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

                    axios.post(API_URLS.school.create, {
                        "name": values.name,
                        "address": values.placedescription,
                        "mapId": values.address,
                        "email": values.mainEmail,
                        "startGrade": values.startGrade,
                        "endGrade": values.endGrade,
                        "principalName": values.principalName,
                        "safeArrivalEmail": values.safeArrivalEmail,
                        "safeArrivalAdminName": values.safeArrivalAdminName,
                        "yearStartDate": values.yearStartDate.format("YYYY-MM-DDTHH:mm:00"),
                        "yearEndDate": values.yearEndDate.format("YYYY-MM-DDTHH:mm:00"),
                        "phoneNumber": values.phoneNumber,
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

                        this.props.updateFormData({
                            schools: [response.data]
                        })

                        this.props._changeLoading(1, false)

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

                        this.props._changeLoading(1, false)
                    }.bind(this))
                }
            })
        })
    }

    render() {
        const { loadingMessage, isLoading } = this.state
        
        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <div style={{ textAlign: "center", maxWidth: 500, margin: "auto", paddingTop: "20px" }}>
                    <h3>Create your first school</h3>

                    <AddSchoolModal
                        visible={true}
                        mode="regular"
                        toggleModal={_ => true}
                        classToEdit={false}
                        editMethods={{}}
                        ref={formComponent => this.formComponent = formComponent}
                    />
                </div>
            <TutorialModal />
            </Spin>
        )
    }
}
