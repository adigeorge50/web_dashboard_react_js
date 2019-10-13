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
const Column = Table.Column
import { message, Spin, Modal } from 'antd'
const confirm = Modal.confirm
import { Menu, Dropdown, Button } from 'antd'

// Misc
import ContentLayout from '../ContentLayout'
import MESSAGES from '../../_data/messages'
import CreateEditModal from './CreateEditModal'

const columnTitles = {
    // "name": "Class Name",
    "grade": "Grade",
    "schoolName": "School"
}

let rowKey = -1

class ClassroomDetailsComponent extends React.Component {
    state = {
        isLoading: true,
        visible: false,
        confirmLoading: false,
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
                    visible: false
                })
    
                message.success(MESSAGES.success.create)
    
                this._getClassroom()
            },
            error: () => {
                message.error(MESSAGES.error.default)
    
                this._toggleModalLoading()
            }
        }
    }

    componentDidMount() {
        this._getClassroom()
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: this.state.isLoading,
        })
    }

    _getClassroom() {
        axios.get(`${API_URLS.classroom.get}/${this.props.match.params.id}`, {
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
                data: {
                    info: Object.keys(columnTitles).map(fieldKey => {
                        return {
                            name: fieldKey,
                            value: data[fieldKey]
                        }
                    }),
                    raw: data
                },
                editMode: data
            })
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
        }.bind(this))
    }

    _delete() {
        this._toggleLoading()

        axios.delete(`${API_URLS.classroom.delete}/${this.props.match.params.id}`, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {            
            this._toggleLoading()
            message.success(MESSAGES.success.delete)

            this.props.history.push('/classrooms')
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
            message.error(MESSAGES.error.default)
        }.bind(this))
    }

    _showDeleteConfirm() {
        confirm({
          title: 'Are you sure?',
          content: 'This action cannot be undone!',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: function() {
            this._delete()
          }.bind(this)
        })
    }

    _toggleEditModal = (on) => {
        this.setState({
            visible: on
        })
    }

    _handleOptionsClick(e) {
        switch (e.key) {
            case 'delete':
                this._showDeleteConfirm()
                break
            case 'edit':
                this._toggleEditModal(true)
                break
        }
    }
    
    render() {
        const { data, isLoading, visible, editMode, confirmLoading } = this.state
            , numOfStudents = (data && data.raw && data.raw.students && data.raw.students.length) || 0

        return (
            <div className="container marginTop-15">
                <div className="card event-details">
                    <Spin spinning={isLoading} className="center-block">
                        {data && data.info &&
                        <div>
                            <ContentLayout
                                sider={
                                    <div>
                                        <h3 style={{ marginBottom: 5 }}>
                                            {data.raw.name}
                                        </h3>
                                    </div>
                                }
                                content={
                                    <div>
                                        <Link to={'/classrooms'}>
                                            <Button size='large' style={{ marginRight: 5 }}>
                                                <Icon type="left" />Back
                                            </Button>
                                        </Link>
                                        
                                        <Dropdown
                                            overlay={
                                                <Menu onClick={this._handleOptionsClick.bind(this)}>
                                                    <Menu.Item key='edit'>
                                                        Edit
                                                    </Menu.Item>

                                                    <Menu.Item key='delete'>Delete</Menu.Item>

                                                    <Menu.Item>
                                                        <Link to={`/onboarding/${data.raw.id}`}>
                                                            Onboard
                                                        </Link>
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                        >
                                            <Button size='large' type='primary'>
                                                Actions<Icon type="down" />
                                            </Button>
                                        </Dropdown>
                                    </div>
                                }
                                contentClass='alignRight'
                            />

                            <Table
                                dataSource={data.info} showHeader={false}
                                pagination={false}
                                rowKey={record => ++rowKey}
                            >
                                <Column
                                    title="name"
                                    dataIndex="name"
                                    key="name"
                                    render={(text, record, index) =>
                                        <span>
                                            <b>{columnTitles[text]}:</b>
                                        </span>
                                    }
                                />

                                <Column
                                    title="value"
                                    dataIndex="value"
                                    key="value"
                                    render={(text, record, index) => 
                                        <div>
                                            {text}
                                        </div>
                                    }
                                />
                            </Table>

                            <h3 className="marginTop-30">
                                {numOfStudents} Student{numOfStudents > 1 ? 's' : ''} enrolled
                            </h3>
                            <Table dataSource={data.raw.students} rowKey={record => ++rowKey}>
                                <Column
                                    title="Full Name"
                                    key="fullname"
                                    render={(text, record) => (
                                        <span>
                                            {record.firstName} {record.lastName}
                                        </span>
                                    )}
                                />
                            </Table>

                            {/* Edit classroom */}
                            <CreateEditModal
                                visible={visible}
                                toggleModal={this._toggleEditModal}
                                classToEdit={editMode}
                                confirmLoading={confirmLoading}
                                editMethods={this.state.editMethods}
                            />
                        </div>
                        }
                    </Spin>
                </div>
            </div>
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
    )(ClassroomDetailsComponent)