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

import { parseQueryString } from "../../../_utils/index"


import ChoosePasswordWizard from "./ChoosePasswordWizard"
// import { Form, Icon, Input, Button, Checkbox } from 'antd';

// const FormItem = Form.Item;

class ParentInvitation extends React.Component {
    state = {
        isLoading: true
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: !this.state.isLoading
        })
    }

    componentDidMount() {
        const queryParams = parseQueryString()
        const { invitationID } = this.props.match.params;
        if (queryParams && queryParams.email && invitationID && !this.props.auth.authToken) {
            // axios.get(API_URLS.classroomInvitation.details(invitationID), {
            //     headers: {
            //         "Authorization": `Bearer ${this.props.authToken}`
            //     }
            // })
            //     .then(function (response) {
            //         console.log("EWFWEFW", response.data)
            //         this.setState({
            //             ...this.state,
            //             invitationDetails: response.data
            //         })


            //     }.bind(this))
            //     .catch(function (error) {
            //         console.log(error)

            //         this.setState({
            //             ...this.state,
            //             isLoading: false
            //         })
            //     }.bind(this))
            axios.head(API_URLS.classroomInvitation.emailExists(queryParams.email), {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                this.setState({
                    ...this.state,
                    isLoading: false,
                    emailExists: true
                })
                localStorage.setItem('invitationID', invitationID);
                this.props.history.push('/');
            }.bind(this))
            .catch(function (error) {

                this._toggleLoading()
            }.bind(this))
        } else {
            this._toggleLoading()
        }
    }

    render() {
        const { isLoading, emailExists } = this.state
        const {newParentId} = this.props.match.params;
        if (!emailExists) {
            return (
                <Spin spinning={isLoading} className="center-block">
                    {!isLoading &&
                        <ChoosePasswordWizard
                            passwordNeeded={!this.props.auth.authToken}
                            invitationID={this.props.match.params.invitationID}
                            authToken={this.props.auth.authToken}
                            newParentId={newParentId}
                            history={this.props.history}
                        />
                    }
                </Spin>
            )
        } else {
            const queryParams = parseQueryString()
            return (
                <Redirect to={`/?email=${queryParams.email}&name=${queryParams.name}`} />
            )
        }
    }
}

ParentInvitation.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Form.create()(ParentInvitation))
