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
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane
import { Badge } from 'antd'
import { Row, Col } from 'antd'
import { Popconfirm, message } from 'antd'
import { Spin } from 'antd'
import { Modal } from 'antd'
const confirm = Modal.confirm
import { Menu, Dropdown } from 'antd'

// Lang
import LANGS from '../../_langs/index'

const columnTitles = {
    // "name": "Form Name",
    "tripName": "Trip Name",
    "address": "Address",
    "departAt": "Departure",
    "arriveOn": "Arrival",
    "classroomName": "Classroom",
    "requiresPayment": "Payment",
    "bankAccountName": "Deposited To",
    "amount": "Amount",
    "notify": "Notify?",
    "fundsCollected": "Total Funds Collected"
}

let rowKey = -1

class EventDetailsComponent extends React.Component {
    state = {
        isLoading: true
    }

    componentDidMount() {
        this._getEvent()
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: this.state.isLoading,
        })
    }

    _getEvent() {
        axios.get(`${API_URLS.form.get}/${this.props.match.params.id}`, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            const { data } = response
                , { columns } = this.state

            if (!data.requiresPayment) {
                delete columnTitles["amount"]
                delete columnTitles["bankAccountName"]
            }

            this.setState({
                ...this.state,
                isLoading: false,
                data: {
                    info: Object.keys(columnTitles).map(fieldKey => {
                        if (fieldKey === "fundsCollected") {
                            return {
                                name: fieldKey,
                                value: 'Coming soon'
                            }
                        } else {
                            return {
                                name: fieldKey,
                                value: data[fieldKey]
                            }
                        }
                    }),
                    replies: data.statuses
                },
                formName: data.name,
                tripName: data.tripName,
                formId: data.id
            }, () => {
                console.log("REPLIES", this.state.replies)
            })
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
        }.bind(this))
    }

    _delete() {
        this._toggleLoading()

        axios.delete(`${API_URLS.form.delete}/${this.props.match.params.id}`, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            console.log(response.data)

            this._toggleLoading()
            message.success('Successfully Deleted')

            this.props.history.push('/')
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
            message.error('Something went wrong!')
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

    _saveAsTemplate() {
        const formID = this.props.match.params.id

        this._toggleLoading()

        axios.post(`${API_URLS.formTemplate.save}/${formID}/template`, {
            id: formID,
            name: "Test Template"
        }, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            console.log(response.data)

            this._toggleLoading()
            message.success('Successfully Saved!')

        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
            message.error('Something went wrong!')
        }.bind(this))
    }

    _downloadForm() {
        const formID = this.props.match.params.id

        this._toggleLoading()

        axios.get(`${API_URLS.form.download}/${formID}`, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            console.log(response.data)

            this._toggleLoading()
            message.success('Successfully Downloaded!')

            this.pdfDownloadLink.href = "data:application/octet-stream;base64," + response.data.pdf
            this.pdfDownloadLink.click()
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
            message.error('Something went wrong!')
        }.bind(this))
    }

    _handleOptionsClick(e) {
        switch (e.key) {
            case 'delete':
                this._showDeleteConfirm()
                break
            case 'template':
                this._saveAsTemplate()
                break
            case 'download':
                this._downloadForm()
                break
        }
    }

    _deleteStudentForm(id) {
        this._toggleLoading()

        axios.delete(API_URLS.studentForm.delete(id), {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            console.log(response.data)

            this._toggleLoading()
            message.success("Successfully deleted")

            this._getEvent()
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this._toggleLoading()
            message.error('Something went wrong!')
        }.bind(this))
    }

    render() {
        const { localization } = this.props
        const { data, formName, tripName, formId, isLoading } = this.state
        const LANG_STRINGS = LANGS[localization.language]

        return (
            <div className="container marginTop-15">
                <Link to="/">
                    <Icon type="left" /> Back to calendar
                </Link>

                <div className="card event-details marginTop-30">
                    {data && data.info &&
                    <div>
                        <a
                            href="#" id="pdf-download-link"
                            ref={pdfDownloadLink => this.pdfDownloadLink = pdfDownloadLink}
                            style={{ display: "none" }}
                            title={`AST Form ${formId}.pdf`}
                            download={`AST Form ${formId}.pdf`}
                        >
                        </a>

                        <Row>
                            <Col span={16}>
                                <h3>
                                    {tripName}
                                </h3>
                            </Col>

                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Dropdown
                                    overlay={
                                        <Menu onClick={this._handleOptionsClick.bind(this)}>
                                            <Menu.Item key='edit'>
                                                <Link to={`/form/edit/${formId}`}>
                                                    Edit
                                                </Link>
                                            </Menu.Item>

                                            <Menu.Item key='delete'>Delete</Menu.Item>
                                            <Menu.Item key='template'>Save as Template</Menu.Item>
                                            <Menu.Item key='download'>Download</Menu.Item>
                                        </Menu>
                                    }
                                    trigger={['click']}
                                >
                                    <Button type='primary'>
                                        Actions<Icon type="down" />
                                    </Button>
                                </Dropdown>
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="1" className="marginTop-15">
                            <TabPane tab="Info" key="1">
                                <Table
                                    dataSource={data.info}
                                    showHeader={false}
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
                                        render={(text, record, index) => {
                                            switch (record.name) {
                                                case 'fundsCollected':
                                                    return text
                                                case 'requiresPayment':
                                                case 'notify':
                                                    return (
                                                        <span>
                                                            <Checkbox
                                                                checked={text}
                                                                disabled={true}
                                                            >
                                                                {text ? 'Yes' : 'No'}
                                                            </Checkbox>
                                                        </span>
                                                    )
                                                case 'amount':
                                                    return (
                                                        <span>
                                                            ${text}
                                                        </span>
                                                    )
                                                case 'departAt':
                                                case 'arriveOn':
                                                    return (
                                                        <span>
                                                            {moment.utc(text, 'YYYY-MM-DDTHH:mm:ss').local().format("dddd, MMMM Do YYYY, h:mm:ss a")}
                                                        </span>
                                                    )
                                                default:
                                                    return (
                                                        <div>
                                                            {text}
                                                        </div>
                                                    )
                                            }
                                        }}
                                    />
                                </Table>
                            </TabPane>

                            {/* <TabPane
                                tab={
                                    <span>
                                        <Badge count={25} style={{ marginLeft: '18px' }}>
                                            Notifications
                                        </Badge>
                                    </span>
                                }
                                key="2"
                            >
                                Tab 2
                            </TabPane> */}

                            <TabPane
                                tab={
                                    <span>
                                        <Badge count={data.replies.filter(reply => reply.completed).length} style={{ marginLeft: '18px' }}>
                                            Replies
                                        </Badge>
                                    </span>
                                }
                                key="3"
                            >
                                <Table dataSource={data.replies} rowKey={record => ++rowKey}>
                                    <Column
                                        title="Full Name"
                                        key="name"
                                        render={(text, record) => (
                                            <span>
                                                {record.studentFirstName} {record.studentLastName}
                                            </span>
                                        )}
                                    />

                                    <Column
                                        title="Completed?"
                                        dataIndex="completed"
                                        key="completed"
                                        render={(text, record) => (
                                            <div>
                                                {record.completed ? <Icon type="check-circle" /> : <Icon type="close-circle" />}

                                                {record.completed &&
                                                    <span>
                                                        {moment(record.completedOn).format("ddd, MMMM Do YYYY")} by {record.completedBy}
                                                    </span>
                                                }
                                            </div>
                                        )}
                                    />

                                    <Column
                                        title="Actions"
                                        dataIndex="actions"
                                        key="actions"
                                        render={(text, record) => (
                                            <div>
                                                {!record.completed &&
                                                    <Button
                                                        type='primary' onClick={() => message.warning('Coming Soon')}
                                                        style={{ marginRight: 10 }}
                                                    >
                                                        Resend
                                                    </Button>
                                                }

                                                <Button type='primary' onClick={this._deleteStudentForm.bind(this, record.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    />

                                    {/* <Column
                                    title="Action"
                                    key="action"
                                    render={(text, record) => (
                                        <span>
                                        <a href="#">Action 一 {record.name}</a>
                                        <Divider type="vertical" />
                                        <a href="#">Delete</a>
                                        <Divider type="vertical" />
                                        <a href="#" className="ant-dropdown-link">
                                            More actions <Icon type="down" />
                                        </a>
                                        </span>
                                    )}
                                    /> */}
                                </Table>
                            </TabPane>
                        </Tabs>
                    </div>
                    }

                    {isLoading &&
                        <Spin style={{ display: 'block', margin: 'auto' }} />
                    }
                </div>
            </div>
        )
    }
}

EventDetailsComponent.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(EventDetailsComponent)
