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
import API_URLS from '../../_data/api_urls'

import moment from 'moment'

// Antd
import { Table, Icon, Divider } from 'antd'
const { Column, ColumnGroup } = Table
import { Checkbox, Button } from 'antd'
const ButtonGroup = Button.Group
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane
import { Badge } from 'antd'
import { Row, Col } from 'antd'
import { Popconfirm, message, Tooltip } from 'antd'
import { Spin } from 'antd'
import { Modal } from 'antd'
const confirm = Modal.confirm
import { Menu, Dropdown, Popover } from 'antd'
import { Form, Input, InputNumber } from 'antd'
const FormItem = Form.Item

// Messages
import MESSAGES from '../../_data/messages'

// Misc
import ContentLayout from '../ContentLayout'
import CreateEditModal from './CreateEditModal'
import { connected as AddSchoolModal } from './AddSchoolModal'

let rowKey = -1

class ClassroomsComponent extends React.Component {
    state = {
        isLoading: true,
        visible: false,
        confirmLoading: false,
        classToEdit: null,
        editMethods: {
            before: () => {
                this.setState({
                    ...this.state,
                    confirmLoading: true
                })
            },
            success: () => {
                this.setState({
                    ...this.state,
                    confirmLoading: false,
                    visible: false,
                    addSchoolVisible: false
                })

                message.success(MESSAGES.success.create)

                this._getClassrooms()
            },
            error: () => {
                message.error(MESSAGES.error.default)

                this._toggleModalLoading()
            }
        }
    }

    componentDidMount() {
        this._getClassrooms()
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: !this.state.isLoading,
        })
    }

    _toggleModalLoading() {
        this.setState({
            ...this.state,
            confirmLoading: this.state.confirmLoading,
        })
    }

    _getClassrooms() {
        axios.get(API_URLS.school.get, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            const { data } = response
                , { columns } = this.state

            this.setState({
                ...this.state,
                isLoading: false,
                data: response.data
            })
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
        }.bind(this))
    }

    triggerClassOrSchoolDelete = (type, id) => {
        if (type === 'school') {
            return this.deleteClassOrSchool(API_URLS.school.delete, id)
        } else if (type === 'class') {
            return this.deleteClassOrSchool(API_URLS.classroom.delete, id)
        }
    }

    /* Delete Classroom */
    deleteClassOrSchool = (url, id) => {
        this._toggleLoading()

        axios.delete(`${url}/${id}`, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
                isLoading: false,
            })

            message.success(MESSAGES.success.delete)

            this._getClassrooms()
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            message.error(MESSAGES.error.default)

            this._toggleLoading()
        }.bind(this))
    }

    /* Create/Edit Classrooms */
    toggleModal = (on, editMode) => {
        this.setState({
            visible: on,
            editMode
        })
    }

    /* Add Schools */
    toggleAddSchoolModal = (on, editMode, schoolToEdit) => {
      this.setState({
          addSchoolVisible: on,
          editMode,
          schoolToEdit: on ? schoolToEdit : null,
      });
    }

    _createClassroom = (values, place, currentSchool) => {
        this.setState({
            ...this.state,
            confirmLoading: true
        })

        axios.post(API_URLS.classroom.create, {
            name: values.name,
            grade: values.grade,
            schoolId: currentSchool.id
        }, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
                confirmLoading: false,
                visible: false
            })

            message.success(MESSAGES.success.create)

            this._getClassrooms()
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            message.error(MESSAGES.error.default)

            this._toggleModalLoading()
        }.bind(this))
    }

    render() {
        const { data, isLoading } = this.state
            , { visible, addSchoolVisible, confirmLoading, editMode } = this.state
            , { getFieldDecorator } = this.props.form

        return (
            <div className="container marginTop-15">
                <ContentLayout
                    sider={
                        <Link to="/">
                            <Icon type="left" /> Back to calendar
                        </Link>
                    }
                    content={
                        <Button type="primary" size='large' onClick={() => this.toggleAddSchoolModal(true, true, null)}>
                            <Icon type="plus" />Add School
                        </Button>
                    }
                    contentClass='alignRight'
                    style={{ marginBottom: 30 }}
                />

                {data && data.map((school, index) =>
                    <div style={{ marginBottom: 45 }} key={`school-${index}`}>
                        <ContentLayout
                            sider={
                                <h3>{school.name}</h3>
                            }
                            content={
                                <ButtonGroup>
                                    <Popover placement="left" title={school.name}
                                        content={
                                            <div>
                                                <ul style={{ padding: '0 0 0 15px', margin: 0 }}>
                                                    <li><b>Address:</b> {school.address}</li>
                                                    <li><b>Email:</b> {school.email}</li>
                                                    <li><b>Grades:</b> {school.startGrade} - {school.endGrade}</li>
                                                    <li><b>Phone Number:</b> {school.phoneNumber}</li>
                                                </ul>
                                            </div>
                                        } trigger="click"
                                    >
                                        <Button>Details</Button>
                                    </Popover>

                                    <Button onClick={() => this.toggleAddSchoolModal(true, true, school)}>
                                        Edit
                                    </Button>

                                    {school.canDelete &&
                                        <Popconfirm placement="top" title={"Are you sure?"} onConfirm={this.triggerClassOrSchoolDelete.bind(this, 'school', school.id)} okText="Yes" cancelText="No">
                                            <Button>Delete</Button>
                                        </Popconfirm>
                                    }

                                    {!school.canDelete &&
                                        <Tooltip placement="left" title="Classrooms in the school need to be removed before it can be removed">
                                            <Button disabled="true">Delete</Button>
                                        </Tooltip>
                                    }
                                </ButtonGroup>
                            }
                            contentClass='alignRight'
                            style={{ marginBottom: 10 }}
                        />

                        <div className="card event-details">
                            <Spin spinning={isLoading} className="center-block">
                                <div>
                                    <ContentLayout
                                        sider={
                                            <h3>{school.classrooms.length} Classroom{school.classrooms.length > 1 ? 's' : ''}</h3>
                                        }
                                        content={
                                            <Button type="primary" size='large' onClick={_ => {
                                                this.setState({
                                                    ...this.state,
                                                    currentSchool: school
                                                }, () => {
                                                    this.toggleModal(true, false)
                                                })
                                            }}>
                                                <Icon type="plus" />Create New
                                            </Button>
                                        }
                                        contentClass='alignRight'
                                    />

                                    <Table dataSource={school.classrooms} rowKey={record => ++rowKey}>
                                        <Column
                                            title="Classroom Name"
                                            key="name"
                                            dataIndex="name"
                                        />

                                        <Column
                                            title="Grade"
                                            key="grade"
                                            dataIndex="grade"
                                        />

                                        <Column
                                            title="Actions"
                                            key="action"
                                            render={(text, record) => (
                                                <span>
                                                    <a href="#" onClick={(e) => {
                                                        e.preventDefault()

                                                        this.toggleModal(true, record)
                                                    }}>
                                                        <Icon type="edit" /> Edit
                                                    </a>
                                                    <Divider type="vertical" />

                                                    {record.canDelete &&
                                                        <Popconfirm placement="top" title={"Are you sure?"} onConfirm={this.triggerClassOrSchoolDelete.bind(this, 'class', record.id)} okText="Yes" cancelText="No">
                                                            <a href="#">
                                                                <Icon type="delete" /> Delete
                                                            </a>
                                                        </Popconfirm>
                                                    }

                                                    {!record.canDelete &&
                                                        <Tooltip placement="left" title="Students in the classroom need to be removed before it can be removed">
                                                            <span style={{ opacity: 0.6 }}>
                                                                <Icon type="delete" /> Delete
                                                            </span>
                                                        </Tooltip>
                                                    }

                                                    <Divider type="vertical" />

                                                    <Link to={`/onboarding/${record.id}`}>
                                                        <Icon type="user-add" /> Class List
                                                    </Link>
                                                </span>
                                            )}
                                        />
                                    </Table>
                                </div>
                            </Spin>
                        </div>
                    </div>
                )}

                {/* Add school */}
                <AddSchoolModal
                    visible={addSchoolVisible}
                    createClassroom={this._createClassroom}
                    confirmLoading={confirmLoading}
                    toggleModal={this.toggleAddSchoolModal}
                    schoolToEdit={this.state.schoolToEdit}
                    editMethods={this.state.editMethods}
                />

                {/* Create/Edit classrooms */}
                <CreateEditModal
                    visible={visible}
                    createClassroom={this._createClassroom}
                    confirmLoading={confirmLoading}
                    toggleModal={this.toggleModal}
                    classToEdit={editMode}
                    editMethods={this.state.editMethods}
                    currentSchool={this.state.currentSchool}
                />
            </div>
        )
    }
}

ClassroomsComponent.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Form.create()(ClassroomsComponent))
