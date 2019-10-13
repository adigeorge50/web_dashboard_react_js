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
import { Table } from 'antd'
const { Column, ColumnGroup } = Table
import { Button, Modal, message, Icon, Divider } from 'antd'
const confirm = Modal.confirm
import { Form, Input, InputNumber, AutoComplete, Select, Tooltip } from 'antd'
const Option = Select.Option
const FormItem = Form.Item
import { Row, Col } from 'antd'
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

// Messages
import MESSAGES from '../../../_data/messages'
import EditParentModal from './EditParentModal';

let uuid = 0

const prepareRequestBody = values => {
    console.log("PARENT EMAILS", values.parentEmails)
    const invitations = values.parentEmails.filter(email => email)
        .map((email, index) => {
            console.log("EMAIL", email, index, values.parentFirstNames[index], values.parentLastNames[index])

            return {
                "parentFirstName": values.parentFirstNames[index],
                "parentLastName": values.parentLastNames[index],
                "email": email
            }
        })

    return {
        "studentFirstName": values.firstName,
        "studentLastName": values.lastName,
        "invitations": invitations
    }
}

let rowKey = -1

class NewOnboardingModal extends React.Component {
    state = {
        dataSource: [],
        place: null,
        editableParent: {}
    }

    componentDidMount() {
        uuid = 0
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

    add = _ => {
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

            this.submitInvitation(values)
        })
    }

    submitInvitation = values => {
        const { classToEdit, editMethods, currentStudent } = this.props
        const { classroomID } = this.props

        this.props.form.validateFields((err, values) => {
            if (err) return

            editMethods.before()

            // console.log("MAKING HTTP CALL", currentStudent)
            const url = currentStudent ? API_URLS.classroomInvitation.put(currentStudent.id) : API_URLS.onBoarding.submit(classroomID)
            axios.post(url, prepareRequestBody(values), {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                },
            })
                .then(function (response) {
                    editMethods.success()

                    this.props.toggleModal(false)
                }.bind(this))
                .catch(function (error) {
                    console.log(error)

                    editMethods.error()
                }.bind(this))
        })
    }

    resendInvitation(invitation, e) {
        e.preventDefault()

        const { editMethods } = this.props
        axios.post(API_URLS.classroomInvitation.resend(invitation.id), {}, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            },
        })
        .then(function (response) {
            editMethods.success()

            // this.props.toggleModal(false)
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            editMethods.error()
        }.bind(this))
    }

    toggleEditParentModal = (on, editMode, parent, e) => {
        if (e) e.preventDefault()

        this.setState({
            editParentVisible: on,
            editMode,
            editableParent: parent
        })
    }

    deleteInvitation(invitation, e) {
        e.preventDefault()

        this.props.deleteInvitation(invitation.id)
    }

    changeValue = (value, name) => {
        this.setState({
            editableParent: {
            ...this.state.editableParent,
            [name]: value
            }
        });
    }

    handleSubmit = () => {
        const {auth} = this.props;
        const {parentFirstName, parentLastName, id} = this.state.editableParent;
        const formData = { parentFirstName, parentLastName, email: this.state.editableParent.sendToEmail};
        
        axios.put(API_URLS.classroomInvitation.put(id.toUpperCase()), formData, {
          headers: {
            "Authorization": `Bearer ${auth.authToken}`
          }
        })
        .then(() => {
            this.setState({
                editParentVisible: false,
            })
            message.success(MESSAGES.success.update)
            this.toggleEditParentModal(false)
            this.props.toggleModal(false)

            this.props.getOnboardingInvitations()
        })
        .catch(error => {
            console.log(error);
            this.setState({
                editParentVisible: false,
            })
        });
    }

    render() {
        const { visible, confirmLoading, classToEdit } = this.props // State variables
            , { toggleModal } = this.props // Methods
            , { editParentVisible, editableParent } = this.state

        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const formItems = keys.map((k, index) => {
            // console.log("key", k)
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

        const { currentStudent } = this.props
        return (
            <Modal
                visible={visible}
                title={currentStudent ? 'Add New Parent' : 'New Student'}
                footer={null}
                onCancel={_ => this.props.toggleModal(false)}
                width='600px'
            >
                {currentStudent && currentStudent.invitations && currentStudent.invitations.length > 0 &&
                    <Table
                        // dataSource={currentStudent.invitations} 
                        dataSource={currentStudent.invitations.filter((e) => { return e.isDeleted !== true })}
                        rowKey={record => ++rowKey}
                        pagination={false} style={{ marginBottom: 15 }}
                        className="table-no-hover"
                    >
                        <Column
                            title="Parent"
                            key="name"
                            render={(text, record) => {
                                // console.log(record)
                                return (
                                    <span>
                                        {record.status == 1 &&
                                            <Tooltip placement="right" title="Accepted">
                                                <Icon type="check" className="invitation-status accepted" />
                                            </Tooltip>
                                        }

                                        {record.status == 0 &&
                                            <Tooltip placement="right" title="Pending">
                                                <Icon type="question" className="invitation-status pending" />
                                            </Tooltip>
                                        }

                                        {record.parentFirstName} {record.parentLastName} ({record.sendToEmail})
                                    </span>
                                )
                            }}
                        />

                        <Column
                            title="Actions"
                            key="action"
                            render={(text, record) => (
                                <span>
                                    {/* {record.canDelete ? */}
                                      {/* (<a href="#" onClick={this.deleteInvitation.bind(this, record)}>
                                        <Icon type="delete" /> Delete
                                      </a>) : */}
                                    {/* ( */}
                                        <Tooltip placement="top" title="By deleting a parent or guardian, you will also remove their access to your classroom. All returned permission forms will be permanently deleted." onClick={this.deleteInvitation.bind(this, record)}>
                                            <Icon type="delete" /> Delete
                                        </Tooltip>
                                       {/* ) */}
                                       {/* }  */}
                                      {record.status == 0 &&
                                        <a href="#" style={{ marginLeft: 10 }} onClick={this.resendInvitation.bind(this, record)}>
                                          <Icon type="mail" /> Resend
                                        </a>
                                      }

                                      <Divider type="vertical" />

                                      <a href="#" style={{ marginLeft: 10 }} onClick={this.toggleEditParentModal.bind(this, true, false, record)}>
                                        <Icon type="edit" /> Edit
                                      </a>
                                </span>
                            )}
                        />
                    </Table>
                }

                <Form
                    onSubmit={this.validateThenSubmit}
                >
                    {!currentStudent &&
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
                    }

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
                <EditParentModal
                    visible={editParentVisible}
                    toggleModal={this.toggleEditParentModal}
                    editableParent = {this.state.editableParent}
                    editValue = {this.changeValue}
                    handleSubmit = {this.handleSubmit}
                />
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
