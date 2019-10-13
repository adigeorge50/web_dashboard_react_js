// React-related
import React, { Fragment } from 'react'
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

// Antd
import { Table, Icon, Divider, Radio } from 'antd'
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

import { parseQueryString } from "../../../_utils/index"
let rowKey = -1
import APP_IMAGE from "../../../img/app.png"
import APPLE_STORE_STICKER from "../../../img/apple_store_sticker.png"
import GOOGLE_PLAY_STICKER from "../../../img/google_play_sticker.png"
import RadioGroup from 'antd/lib/radio/group';


class ParentsOnboardingIndex extends React.Component {
    state = {
        isLoading: true,
        visible: false,
        confirmLoading: false,
        data: null,
        invitation: null,
        checked: '',
        linkTo: null,
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

    _toggleLoading() {
        this.setState({
            isLoading: !this.state.isLoading,
        })
    }

    _toggleModalLoading() {
        this.setState({
            confirmLoading: this.state.confirmLoading,
        })
    }


    _getOnboardingInvitations() {	
        const invitationID = localStorage.getItem('invitationID');
        axios.all([
            axios.get(API_URLS.classroomInvitation.get, {	
                headers: {	
                    "Authorization": `Bearer ${this.props.auth.authToken}`	
                }	
            }),
            axios.get(API_URLS.classroomInvitation.getChild, {	
                headers: {	
                    "Authorization": `Bearer ${this.props.auth.authToken}`	
                }	
            }),
            axios.get(API_URLS.classroomInvitation.details(invitationID), {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
        ])
        .then(axios.spread((invitation, children, invitationInfo) => {
            if(children.data.length === 0) {
                const invitationID = localStorage.getItem('invitationID');
                const {data} = invitationInfo;
                this.props.history.replace(`/classroominvitation/${invitationID}/?firstName=${data.studentFirstName.trim()}&lastName=${data.studentLastName.trim()}`)
            } else {

                const newChildren = [
                    ...children.data, 
                    {
                        studentFirstName: invitationInfo.data.studentFirstName,
                        studentLastName: invitationInfo.data.studentLastName,
                        firstName: 'New',
                        lastName: 'Student',
                        id: 'new',
                    }
                ];

                this.setState({	
                   isLoading: false,	
                   children: newChildren,
                   invitation: invitationInfo.data,
               });
            }
        }))	
        .catch(function (error) {
            console.log(error)	

             this._toggleLoading()	
        }.bind(this))	
    }

    componentDidMount() {
        this._getOnboardingInvitations();
    }

    setLink = linkTo => {
        this.setState({linkTo})
    }

    selectRadio = (target) => {
        const invitationID = localStorage.getItem('invitationID');
        const invitedUser = this.state.children.find(child => child.id === target.value);
        const linkTo = invitedUser.id === 'new' ? 
        `/classroominvitation/${invitationID}/?firstName=${invitedUser.studentFirstName.trim()}&lastName=${invitedUser.studentLastName.trim()}`
        : `/classroominvitation/${invitationID}/?firstName=${invitedUser.firstName.trim()}&lastName=${invitedUser.lastName.trim()}&childId=${invitedUser.id}`
        this.setState({checked: target.value, linkTo});
    }

    render() {
        const invitationID = localStorage.getItem('invitationID');

        const { children, isLoading, invitation } = this.state
            , { visible, addSchoolVisible, confirmLoading, editMode } = this.state
            , { getFieldDecorator } = this.props.form
        return (
          <Fragment>
              <Spin spinning={isLoading} className="center-block">
                {invitationID && invitation &&
                    <div className="container marginTop-15" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div style={{ marginBottom: 45 }}>
                            <div className="card event-details">
                                <div>
                                    <h2 style={{textAlign: 'center', marginBottom: '32px'}}>
                                        {
                                            `${invitation.teacherFirstName} ${invitation.teacherLastName} 
                                            would like to invite ${invitation.studentFirstName} ${invitation.studentLastName} to join 
                                            ${invitation.classroomName} at ${invitation.schoolName}`
                                        }
                                    </h2>
                                    {
                                        children && children.length && 
                                        <h4>
                                            {`Please select ${invitation.studentFirstName} ${invitation.studentLastName} 
                                                from the list below. If they do not appear, select "Add new student".
                                            `}
                                        </h4>
                                    }
                                    <RadioGroup onChange={({target}) => this.selectRadio(target)} style={{width: '100%'}} value={this.state.checked}>
                                        <Table dataSource={children} pagination={false} rowKey={record => ++rowKey}>
                                            <Column
                                                title="Student"
                                                key="name"
                                                render={(text, record) => (
                                                    <Radio 
                                                        value={record.id}
                                                        name={`${record.firstName} ${record.lastName}`}
                                                    >
                                                        {record.firstName} {record.lastName}
                                                    </Radio>
                                                )}
                                            />
                                        </Table>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                        {!!this.state.linkTo && 
                        <Button type="primary" size="large" onClick={() => this.props.history.push(this.state.linkTo)}>CONTINUE</Button>
                    }</div>
                }
            </Spin>
            {!children && !isLoading && (<div style={{ textAlign: "center" }}>
                <h3 style={{ marginTop: 15 }}>Download the At School Today App!</h3>
                <img src={APP_IMAGE} style={{ maxWidth: 300 }} />

                <p style={{ maxWidth: 400, margin: "auto", marginBottom: 15 }}>A customizable app free for your class or school. With notifications, auto-fill permission forms and easy payments.</p>

                <div>
                    <img src={APPLE_STORE_STICKER} style={{ maxWidth: 159 }} />
                    <img src={GOOGLE_PLAY_STICKER} style={{ maxWidth: 200 }} />
                </div>
            </div>)}
          </Fragment> 
        )
    }
}

ParentsOnboardingIndex.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Form.create()(ParentsOnboardingIndex))
