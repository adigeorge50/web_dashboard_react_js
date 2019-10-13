// React-related
import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    IndexRoute,
    Redirect,
    withRouter
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
import MESSAGES from '../../../_data/messages'

// Misc
import ContentLayout from '../../ContentLayout'
import NewOnboardingModal from './NewOnboardingModal'
import EditStudentModal from './EditStudentModal'

let rowKey = -1

class ClassroomsComponent extends React.Component {
    state = {
        isLoading: true,
        visible: false,
        confirmLoading: false,
        editableStudent: {},
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
    
                this._getOnboardingInvitations()
            },
            error: () => {
                message.error(MESSAGES.error.default)
    
                this._toggleModalLoading()
            }
        }
    }

    componentDidMount() {
        this._getOnboardingInvitations()
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

    _getOnboardingInvitations = () => {
        const { classroomID } = this.props.match.params
        axios.get(API_URLS.onBoarding.get(classroomID), {
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

    /* Create/Edit Classrooms */
    toggleModal = (on, editMode) => {
        this.setState({
            visible: on,
            editMode
        })
    }

    /* Add Schools */
    toggleAddSchoolModal = (on, editMode, student, e) => {
        if (e) e.preventDefault()

        this.setState({
            addSchoolVisible: on,
            editMode,
            currentStudent: student
        })
    }

    toggleEditStudentModal = (on, editMode, student, e) => {
        if (e) e.preventDefault()

        this.setState({
            editStudentVisible: on,
            editMode,
            editableStudent: student
        })
    }

    deleteInvitation(invitationID) {
        this._toggleLoading()
        const formData = {ParentId: invitationID, IsDeleted: "true", Id: String(this.state.currentStudent.classroomId)}

        axios.put(API_URLS.classroomInvitation.delete(invitationID, this.state.currentStudent.classroomId), formData, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            this.setState({
                ...this.state,
                isLoading: false,
                addSchoolVisible: false
            })

            this._getOnboardingInvitations()

            this._toggleLoading()

            message.success(MESSAGES.success.delete)
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this.setState({
                ...this.state,
                isLoading: false,
                addSchoolVisible: false
            })

            message.error(MESSAGES.error.default)
        }.bind(this))
    }
    
    _createClassroom = (values, place) => {
        this.setState({
            ...this.state,
            confirmLoading: true
        })

        axios.post(API_URLS.classroom.create, {
            name: values.name,
            grade: values.grade,
            schoolName: place.description,
            schoolMapId: place.place_id
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

            this._getOnboardingInvitations()
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            message.error(MESSAGES.error.default)

            this._toggleModalLoading()
        }.bind(this))
    }

    changeValue = (value, name) => {
        this.setState({
            editableStudent: {
            ...this.state.editableStudent,
            [name]: value
            }
        });
    }

    handleSubmit = () => {
        const {auth} = this.props;
        const {studentFirstName, studentLastName, studentId, classroomId} = this.state.editableStudent;
        const formData = { studentFirstName, studentLastName, classsroomId: classroomId , studentId};
        
        axios.put(`${API_URLS.student.put}`, formData, {
          headers: {
            "Authorization": `Bearer ${auth.authToken}`
          }
        })
        .then(() => {
            this.setState({
                editStudentVisible: false,
            })
            message.success(MESSAGES.success.update)
            this._getOnboardingInvitations()
        })
        .catch(error => {
            console.log(error);
            this.setState({
                editStudentVisible: false,
            })
        });
    }

    deleteStudent = record => {
        let invitationsLength = record.invitations.filter((e) => { return e.isDeleted !== true }).length

        // if(invitationsLength !== 0) {
            this.setState({
                ...this.state,
                isLoading: true
            })
    
            const {classroomId, studentId} = record
            const formData = {Id: String(classroomId), StudentId: String(studentId), IsDeleted: 'true'}
    
            axios.put(API_URLS.classroom.deleteStudent(record.classroomId, record.studentId), formData, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                this.setState({
                    ...this.state,
                    isLoading: false
                })

                message.success(MESSAGES.success.delete)
    
                this._getOnboardingInvitations()
            }.bind(this))
            .catch(function (error) {

                this.setState({
                    ...this.state,
                    isLoading: false
                })
    
                message.error("You must remove all parents and guardians from the student before they can be deleted.")
            }.bind(this))
        // } else {
        //     message.error("You cannot delete student with no parents")
        // }
    }

    render() {
        const { data, isLoading } = this.state
            , { visible, addSchoolVisible, confirmLoading, editMode, editStudentVisible, editableStudent } = this.state
            , { getFieldDecorator } = this.props.form

        return (
            <Spin spinning={isLoading} className="center-block">
                {data &&
                    <div className="container marginTop-15">
                        <ContentLayout
                            sider={
                                <div>
                                    <Link to="/classrooms">
                                        <Icon type="left" /> Back to classrooms
                                    </Link>

                                    <h3>{data.length > 0 ? data[0].schoolName : ''}</h3>
                                </div>
                            }
                            content={
                                <div>
                                    {/* {data[0] && data[0].classroomId &&
                                        <Link to={`/classrooms/${data[0].classroomId}`}>
                                            <Button size='large' style={{ marginRight: 10 }}>
                                                Class Details
                                            </Button>
                                        </Link>
                                    } */}

                                    <Button type="primary" size='large' onClick={this.toggleAddSchoolModal.bind(this, true, false, null)}>
                                        <Icon type="plus" />New Student
                                    </Button>
                                </div>
                            }
                            contentClass='alignRight'
                            style={{ marginBottom: 30 }}
                        />
                        
                        <div style={{ marginBottom: 45 }}>
                            <div className="card event-details">
                                <div>
                                    <h3>{data.length > 0 ? data[0].classroomName : ''}</h3>

                                    <Table dataSource={data.filter((e) => { return e.isDeleted !== true })} rowKey={record => ++rowKey}>
                                        <Column
                                            title="Student Name"
                                            key="name"
                                            render={(text, record) => (
                                                <span>
                                                    {record.studentFirstName} {record.studentLastName}
                                                </span>
                                            )}
                                        />

                                        <Column
                                            title="Invitations"
                                            key="invitations"
                                            render={(text, record) => (
                                                <span>
                                                    {record.invitations.filter((e) => { return e.isDeleted !== true }).length}

                                                    <Popover placement="left" title="Invitations"
                                                        content={
                                                            <div>
                                                                <ul style={{ padding: '0 0 0 15px', margin: 0 }}>
                                                                    {record.invitations.filter((e) => { return e.isDeleted !== true }).map((invite, i) =>
                                                                        <li key={`invitation-detail-${i}`}>
                                                                            {invite.parentFirstName} {invite.parentLastName}
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        } trigger="hover"
                                                    >
                                                        <Icon type="info-circle-o" style={{ marginLeft: 5 }} />
                                                    </Popover>
                                                </span>
                                            )}
                                        />

                                        <Column
                                            title="Actions"
                                            key="action"
                                            render={(text, record) => (
                                                <span>
                                                    {/* <Popconfirm
                                                        placement="top" title={"Are you sure?"}
                                                        onConfirm={_ => {
                                                            console.log(record)
                                                            
                                                            if (record.invitations.length > 0) {
                                                                this.deleteInvitation(record.invitations[0].id)
                                                            }
                                                        }} okText="Yes" cancelText="No"
                                                    >
                                                        <a href="#">
                                                            <Icon type="delete" /> Delete
                                                        </a>
                                                    </Popconfirm> */}

                                                    <a href="#" onClick={this.toggleAddSchoolModal.bind(this, true, false, record)}>
                                                        <Icon type="mail" /> Invites
                                                    </a>

                                                    <Divider type="vertical" />


                                                    <a href="#" onClick={this.deleteStudent.bind(this, record)}>
                                                        <Icon type="delete" /> Delete
                                                    </a>

                                                     <Divider type="vertical" />

                                                    <a href="#" onClick={this.toggleEditStudentModal.bind(this, true, false, record)}>
                                                        <Icon type="edit" /> Edit
                                                    </a>
                                                </span>
                                            )}
                                        />
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Add school */}
                        {addSchoolVisible &&
                            <NewOnboardingModal
                                visible={addSchoolVisible}
                                createClassroom={this._createClassroom}
                                classroomID={this.props.match.params.classroomID}
                                confirmLoading={confirmLoading}
                                toggleModal={this.toggleAddSchoolModal}
                                classToEdit={false}
                                editMethods={this.state.editMethods}
                                currentStudent={this.state.currentStudent}
                                deleteInvitation={this.deleteInvitation.bind(this)}
                                getOnboardingInvitations={this._getOnboardingInvitations}
                            />
                        }

                        <EditStudentModal
                             visible={editStudentVisible}
                             toggleModal={this.toggleEditStudentModal}
                             editableStudent = {this.state.editableStudent}
                             editValue = {this.changeValue}
                             handleSubmit = {this.handleSubmit}
                        />
                    </div>
                }
            </Spin>
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
    )(Form.create()(withRouter(ClassroomsComponent)))