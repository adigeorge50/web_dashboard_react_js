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
import API_URLS from '../_data/api_urls'

// Calendar
import BigCalendar, { Toolbar } from 'react-big-calendar'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.less'
const DragAndDropCalendar = withDragAndDrop(BigCalendar)

import moment from 'moment'

// Antd
import { Layout, Icon } from 'antd'
const { Header, Content, Footer, Sider } = Layout
import { Menu, Dropdown, Button } from 'antd'
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
import { Spin, message } from 'antd'
import ContentLayout from './ContentLayout'

// Lang
import LANGS from '../_langs/index'

moment.locale('en')
BigCalendar.momentLocalizer(moment)

class CustomToolbar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            filtersMenuVisible: false
        }
    }

    componentDidMount() {
        const { activeCalView } = this.props.toolbarState
        if (activeCalView) {
            this.props.onViewChange(activeCalView)
        }
    }

    goToBack() {
        switch(this.props.toolbarState.activeCalView) {
            case 'month':
                this.props.date.setMonth(this.props.date.getMonth() - 1)
                break
            case 'week':
                this.props.date.setDate(this.props.date.getDate() - 7)
                break
            case 'day':
                this.props.date.setDate(this.props.date.getDate() - 1)
                break
        }
        this.props.onNavigate('prev');
    }

    goToNext() {
        switch(this.props.toolbarState.activeCalView) {
            case 'month':
                this.props.date.setMonth(this.props.date.getMonth() + 1)
                break
            case 'week':
                this.props.date.setDate(this.props.date.getDate() + 7)
                break
            case 'day':
                this.props.date.setDate(this.props.date.getDate() + 1)
                break
        }
        this.props.onNavigate('next');
    }

    goToCurrent() {
        const now = new Date();
        this.props.date.setMonth(now.getMonth());
        this.props.date.setYear(now.getFullYear());
        this.props.date.setDate(now.getDate())
        this.props.onNavigate('current');
    }

    changeView(viewName) {
        this.props.onViewChange(viewName)
        this.props._updateToolbarState("activeCalView", viewName)
    }

    _handleOptionsVisibility(flag) {
        this.setState({
            ...this.state,
            filtersMenuVisible: flag
        })
    }

    _handleOptionsClick(e) {
        if (e.key.indexOf('cal') > -1) {
            this.changeView(e.key.replace('cal-', ''))
        } else if (e.key.indexOf('classroom') > -1) {
            const classID = e.key.replace('classroom-', '')
                , { _toggleLoading, _getEvents } = this.props

            _toggleLoading()

            if (classID === "SHOW_ALL") {
                _getEvents().then(() => {
                    _toggleLoading()

                    this.props._updateToolbarState("activeClassroom", undefined)
                })
            } else {
                _getEvents(classID).then(() => {
                    _toggleLoading()

                    this.props._updateToolbarState("activeClassroom", classID)
                })
            }
        }

        this._handleOptionsVisibility(false)
    }

    render() {
        const { filtersMenuVisible } = this.state
            , { localization, filters, classrooms, toolbarState } = this.props
            , LANG_STRINGS = LANGS[localization.language].HOME.calendar.toolbar

        return (
            <div className="calendar-toolbar">
                <div>
                    <ContentLayout
                        sider={
                            <h3>{this.props.label}</h3>
                        }

                        content={
                            <Dropdown overlay={
                                <Menu>
                                    {
                                        ['Event', 'Permission Form', 'Newsletter', 'Notification', 'Payment & Fundraising', 'Homework']
                                            .map((menuItemTitle, i) =>
                                                <Menu.Item key={`create-item-${i}`}>
                                                    <Link to={'/form/create'}>
                                                        {menuItemTitle}
                                                    </Link>
                                                </Menu.Item>
                                            )
                                    }
                                </Menu>
                            } trigger={['click']} placement="bottomRight">
                                <Button type="primary" size='large'>
                                    <Icon type="plus" />
                                    {LANG_STRINGS.addEntries}
                                </Button>
                            </Dropdown>
                        }

                        contentClass='alignRight'
                    />
                </div>

                <div>
                    <ContentLayout
                        sider={
                            <Dropdown
                                overlay={
                                    <Menu onClick={this._handleOptionsClick.bind(this)}>
                                        <MenuItemGroup title="Classrooms">
                                            {classrooms.map((classroom, index) =>
                                                <Menu.Item
                                                    key={`classroom-${classroom.id}`}
                                                    className={toolbarState.activeClassroom == classroom.id ? 'active' : ''}
                                                >
                                                    {classroom.name}
                                                </Menu.Item>
                                            )}

                                            <Menu.Item
                                                key={`classroom-SHOW_ALL`}
                                                className={toolbarState.activeClassroom == undefined ? 'active' : ''}
                                            >
                                                All Classrooms
                                            </Menu.Item>
                                        </MenuItemGroup>

                                        <MenuItemGroup title="Calendar View" className="not-first">
                                            <Menu.Item key='cal-day' className={toolbarState.activeCalView === 'day' ? 'active' : ''}>Day</Menu.Item>
                                            <Menu.Item key='cal-week' className={toolbarState.activeCalView === 'week' ? 'active' : ''}>Week</Menu.Item>
                                            <Menu.Item key='cal-month' className={toolbarState.activeCalView === 'month' ? 'active' : ''}>Month</Menu.Item>
                                        </MenuItemGroup>

                                        <MenuItemGroup title="Filters" className="not-first">
                                            {filters.map((filter, index) =>
                                                <Menu.Item key={`filter-${index}`}>{filter.name}</Menu.Item>
                                            )}
                                        </MenuItemGroup>
                                    </Menu>
                                }
                                onVisibleChange={this._handleOptionsVisibility.bind(this)}
                                visible={filtersMenuVisible}
                                trigger={['click']}
                            >
                                <Button size='large'>
                                    Options <Icon type="setting" />
                                </Button>
                            </Dropdown>
                        }

                        content={
                            <Button.Group size='large'>
                                <Button onClick={this.goToBack.bind(this)}>
                                    <Icon type="left" />
                                </Button>

                                <Button onClick={this.goToCurrent.bind(this)}>
                                    {LANG_STRINGS.today}
                                </Button>

                                <Button onClick={this.goToNext.bind(this)}>
                                    <Icon type="right" />
                                </Button>
                            </Button.Group>
                        }

                        contentClass='alignRight'
                        className="marginTop-15"
                    />
                </div>
            </div >
        )
    }
}

const ReduxCustomToolbar = ({ filters, classrooms, _getEvents, _toggleLoading, toolbarState, _updateToolbarState }) => {
    return (
        compose(
            connect(
                (state) => ({
                    localization: state.localization,
                    filters,
                    classrooms,
                    _getEvents,
                    _toggleLoading,
                    toolbarState,
                    _updateToolbarState
                }),
                // mapDispatchToProps
            )
        )(CustomToolbar)
    )
}

class HomeComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            toolbar: {
                activeCalView: "month"
            }
        }
    }

    componentDidMount() {
        Promise.all([this._getEvents(), this._getClassrooms()]).then(() => {
            this.setState({
                ...this.state,
                isLoading: false
            })
        })
    }

    _getClassrooms() {
        return new Promise((resolve, reject) => {
            axios.get(API_URLS.classroom.get, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                this.setState({
                    ...this.state,
                    classrooms: response.data
                })

                resolve(true)
            }.bind(this))
            .catch(function (error) {
                console.log(error)

                reject(false)
            })
        })
    }

    _getEvents(classroomID) {
        const currentYear = parseFloat(moment().format('YYYY'));
        let url = `${API_URLS.engagements.get}?start=${currentYear - 1}-01-01T01:01:01&end=${currentYear + 2}-01-01T01:01:01`
        if (classroomID) url += `&classroomId=${classroomID}`

        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                // console.log(response)

                let events = []
                response.data.engagements.map(event => {
                    events.push({
                        id: event.id,
                        title: event.title,
                        start: new Date(event.engagementDate),
                        end: new Date(event.engagementDate)
                    })
                })

                this.setState({
                    ...this.state,
                    engagements: events,
                    filters: response.data.filters
                })

                resolve(true)
            }.bind(this))
            .catch(function (error) {
                console.log(error)

                reject(false)
            })
        })
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: !this.state.isLoading
        })
    }

    _updateToolbarState(field, value) {
        this.setState({
            ...this.state,
            toolbar: {
                ...this.state.toolbar,
                [field]: value
            }
        })
    }

    _handleSelectEvent(event) {
        this.props.history.push(`/events/${event.id}`)
    }

    moveEvent({ event, start, end }) {
        const { engagements } = this.state;
        const idx = engagements.indexOf(event);
        const updatedEvent = { ...event, start, end };

        alert(`TODO - Backend endpoint\nStart: ${start}\nEnd: ${end}`);
        // const nextEvents = [...events]
        // nextEvents.splice(idx, 1, updatedEvent)

        // this.setState({
        //     events: nextEvents
        // })

        // alert(`${event.title} was dropped onto ${event.start}`);
    }

    render() {
        const { isLoading, students, engagements, filters, classrooms } = this.state

        moment.locale(this.props.localization.language)
        BigCalendar.momentLocalizer(moment)

        // const dndCalendar = DragDropContext(HTML5Backend)(Dnd)

        return (
            <div className="container" style={{ position: "relative" }}>
                {isLoading &&
                    <Spin style={{ display: 'block', margin: '30px auto 0 auto' }} />
                }

                {!isLoading && engagements &&
                    <DragAndDropCalendar
                        className="marginTop-30"
                        style={{ height: "700px", marginBottom: "30px" }}
                        events={engagements}
                        step={60}
                        showMultiDayTimes
                        defaultDate={new Date()}
                        components={{
                            toolbar: ReduxCustomToolbar({
                                filters,
                                classrooms,
                                _getEvents: this._getEvents.bind(this),
                                _toggleLoading: this._toggleLoading.bind(this),
                                toolbarState: this.state.toolbar,
                                _updateToolbarState: this._updateToolbarState.bind(this)
                            })
                        }}
                        onSelectEvent={(event) => { this._handleSelectEvent(event) }}
                        startAccessor={(event) => {return moment(event.start).toDate()}}
                        endAccessor={(event) => {return moment(event.end).toDate()}}
                        onEventDrop={this.moveEvent.bind(this)}
                    />
                }


            </div>
        )
    }
}

HomeComponent.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(HomeComponent)
