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
import { Button, Modal, message } from 'antd'
const confirm = Modal.confirm
import { Form, Input, InputNumber, AutoComplete, Select } from 'antd'
const Option = Select.Option

const FormItem = Form.Item

// Messages
import MESSAGES from '../../_data/messages'

// Misc
import ContentLayout from '../ContentLayout'
import POWERED_BY_GOOGLE from '../../img/powered_by_google.png'

class CreateEditModal extends React.Component {
    state = {
        dataSource: [],
        place: null
    }

    componentWillReceiveProps(nextProps) {
        const { classToEdit } = nextProps
        if (this.props.visible !== nextProps.visible) {
            this.props.form.setFieldsValue({
                name: classToEdit ? classToEdit.name : null,
                grade: classToEdit ? classToEdit.grade : null,
                address: classToEdit ? classToEdit.schoolName : null
            })
        }
    }

    validateThenCreateClassroom = (e) => {
        e.preventDefault()

        this.props.form.validateFields((err, values) => {
            if (err) return

            const { dataSource } = this.state
                , place = dataSource.find(item => item.id == values.address)

            this.props.createClassroom(values, place, this.props.currentSchool)
        })
    }

    _validateAddress = (rule, value, callback) => {
        const { place } = this.state

        if (place) {
            callback()
        } else {
            callback(
                'Please type and select an address'
            )
        }
    }

    _addressAutoComplete = (value) => {
        if (value.length > 0) {
            const service = new google.maps.places.AutocompleteService()
                , options = { input: value, componentRestrictions: {country: 'CA'} }

            service.getPlacePredictions(options, (predictions, status) => {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                console.log(status)

                return
                }

                this.setState({
                    ...this.state,
                    dataSource: predictions
                })
            })
        } else {
            console.log("VALU ELENGHT > 0")
        }
    }

    _addressSelect = (value) => {
        const { dataSource } = this.state
            , place = dataSource.find(item => item.id == value)

        this.setState({
            ...this.state,
            place
        }, () => {
            this.props.form.validateFields(['address'])
        })
    }

    updateClassroom = (e) => {
        e.preventDefault()

        const { classToEdit, editMethods } = this.props
        this.props.form.validateFields((err, values) => {
            if (err) return

            editMethods.before()

            const { dataSource } = this.state

            axios.put(`${API_URLS.classroom.update}/${classToEdit.id}`, {
                ...classToEdit,
                ...values
            }, {
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
            , { getFieldDecorator } = this.props.form
            , { dataSource, place } = this.state

        return (
            <Modal
                visible={visible}
                title={!classToEdit ? 'Create a new Classroom' : `Edit ${classToEdit.name}`}
                footer={null}
                onCancel={_ => this.props.toggleModal(false)}
            >
                <Form
                    onSubmit={!classToEdit ? this.validateThenCreateClassroom : this.updateClassroom}
                >
                    <FormItem label='Name'>
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: 'Please provide the name of the class',
                            }],
                        })(
                            <Input placeholder="English Class" />
                        )}
                    </FormItem>

                    <FormItem label='Grade'>
                        {getFieldDecorator('grade', {
                            rules: [{
                                required: true,
                                message: 'Please enter the grade in which the class is offered in',
                            }],
                        })(
                        <Select>
                          <Option value='JK'>JK</Option>
                          <Option value='SK'>SK</Option>
                          <Option value='1'>1</Option>
                          <Option value='2'>2</Option>
                          <Option value='3'>3</Option>
                          <Option value='4'>4</Option>
                          <Option value='5'>5</Option>
                          <Option value='6'>6</Option>
                          <Option value='7'>7</Option>
                          <Option value='8'>8</Option>
                          <Option value='9'>9</Option>
                          <Option value='10'>10</Option>
                          <Option value='11'>11</Option>
                          <Option value='12'>12</Option>
                        </Select>
                        )}
                    </FormItem>

                    <div className="alignRight">
                        <Button size='large' style={{ marginRight: 5 }} onClick={toggleModal.bind(this, false)} disabled={confirmLoading}>
                            Cancel
                        </Button>

                        <Button size='large' type="primary" htmlType="submit" loading={confirmLoading}>
                            {classToEdit ? 'Update' : 'Create'}
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
    )(Form.create()(CreateEditModal))
