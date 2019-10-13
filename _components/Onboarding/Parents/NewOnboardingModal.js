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
import API_URLS from '../../../_data/api_urls'

import moment from 'moment'

// Antd
import { Button, Modal, message, Icon } from 'antd'
const confirm = Modal.confirm
import { Form, Input, InputNumber, AutoComplete, Select } from 'antd'
const Option = Select.Option
const FormItem = Form.Item
import { Row, Col } from 'antd'
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

// Messages
import MESSAGES from '../../../_data/messages'

let uuid = 0

const prepareRequestBody = values => {
    const invitations = values.parentEmails.map((email, index) => ({
        "parentFirstName": values.parentFirstNames[index],
        "parentLastName": values.parentLastNames[index],
        "email": email
    }))

    return {
        "studentFirstName": values.firstName,
        "studentLastName": values.lastName,
        "invitations": invitations
    }
}

class NewOnboardingModal extends React.Component {
    state = {
        dataSource: [],
        place: null
    }

    componentDidMount() {
        this.add()
    }

    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        uuid++;
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    }

    validateThenSubmit = (e) => {
        e.preventDefault()
        
        this.props.form.validateFields((err, values) => {
            if (err) return

            const { dataSource } = this.state
            
            this.submitInvitation(values)
        })
    }

    submitInvitation = values => {        
        const { classToEdit, editMethods } = this.props
        const { classroomID } = this.props
        
        this.props.form.validateFields((err, values) => {
            if (err) return
            
            editMethods.before()

            const { dataSource } = this.state
                , place = dataSource.find(item => item.id == values.address)
                
            axios.post(API_URLS.onBoarding.submit(classroomID), prepareRequestBody(values), {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                },
            })
            .then(function (response) {
                editMethods.success()
            }.bind(this))
            .catch(function (error) {
                console.log(error)
    
                editMethods.error()
            }.bind(this))
        })
    }
    
    render() {
        const { visible, confirmLoading, classToEdit } = this.props // State variables
            , { createClassroom, toggleModal } = this.props // Methods
            , { dataSource, place } = this.state

        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const formItems = keys.map((k, index) => {
            return (
                <div key={`parent-${index}`}>
                    <h5>
                        Parent {index + 1}

                        {keys.length > 1 ? (
                            <Icon
                                className="dynamic-delete-button"
                                style={{ float: "right" }}
                                type="minus-circle-o"
                                disabled={keys.length === 1}
                                onClick={() => this.remove(k)}
                            />
                        ) : null}
                    </h5>

                    <Row gutter={32}>
                        <Col xs={12} md={12} lg={12}>
                            <FormItem
                                label="First Name"
                                required={true}
                                key={`${k}-firstName`}
                            >
                                {getFieldDecorator(`parentFirstNames[${k}]`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [{
                                        required: true,
                                        whitespace: true,
                                        message: "Please provide the parent's first name",
                                    }],
                                })(
                                    <Input placeholder="Lisa" style={{ width: '100%', marginRight: 8 }} />
                                )}
                                
                            </FormItem>
                        </Col>

                        <Col xs={12} md={12} lg={12}>
                            <FormItem
                                label="Last Name"
                                required={true}
                                key={`${k}-lastName`}
                            >
                                {getFieldDecorator(`parentLastNames[${k}]`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [{
                                        required: true,
                                        whitespace: true,
                                        message: "Please provide the parent's last name",
                                    }],
                                })(
                                    <Input placeholder="Kinghorn" style={{ width: '100%', marginRight: 8 }} />
                                )}
                                
                            </FormItem>
                        </Col>
                    </Row>

                    <FormItem label='Email Address'>
                        {getFieldDecorator(`parentEmails[${k}]`, {
                            rules: [{
                                required: true,
                                message: "Please provide the parent's email address",
                            }],
                        })(
                            <Input placeholder="kinghlisa@email.address" />
                        )}
                    </FormItem>
                </div>
            )
        })
        
        return (
            <Modal
                visible={visible}
                title={'New Onboarding Invitation'}
                footer={null}
                onCancel={_ => this.props.toggleModal(false)}
            >
                <Form
                    onSubmit={this.validateThenSubmit}
                >
                    <Row gutter={32}>
                        <Col xs={12} md={12} lg={12}>
                            <FormItem label='Student First Name'>
                                {getFieldDecorator('firstName', {
                                    rules: [{
                                        required: true,
                                        message: "Please provide the student's first name",
                                    }],
                                })(
                                    <Input placeholder="Brian" />
                                )}
                            </FormItem>
                        </Col>

                        <Col xs={12} md={12} lg={12}>
                            <FormItem label='Student Last Name'>
                                {getFieldDecorator('lastName', {
                                    rules: [{
                                        required: true,
                                        message: "Please provide the student's last name",
                                    }],
                                })(
                                    <Input placeholder="Smith" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    {formItems}
                    <FormItem>
                        <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
                            <Icon type="plus" /> Add Another Parent
                        </Button>
                    </FormItem>

                    <div className="alignRight">
                        <Button size='large' style={{ marginRight: 5 }} onClick={toggleModal.bind(this, false)} disabled={confirmLoading}>
                            Cancel
                        </Button>

                        <Button size='large' type="primary" htmlType="submit" loading={confirmLoading}>
                            Create
                        </Button>
                    </div>
                </Form>
            </Modal>
        )
    }
}


export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
            }),
        )
    )(Form.create()(NewOnboardingModal))