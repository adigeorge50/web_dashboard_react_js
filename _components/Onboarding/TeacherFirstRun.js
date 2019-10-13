// React-related
import React from 'react'

import { EurekaForm } from 'react-eureka'

import { Row, Col } from 'antd'
import { Divider, DatePicker, Tooltip } from 'antd'
import { Form, Input, AutoComplete, Button, Radio } from 'antd'
const RadioGroup = Radio.Group
import { Icon } from 'antd'
const FormItem = Form.Item
import { message } from 'antd'

import POWERED_BY_GOOGLE from '../../img/powered_by_google.png'

const dateStringFormat = "YYYY-MM-DD"

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
}

// const hasErrors = fieldsError => Object.keys(fieldsError).some(field => fieldsError[field])

class TeacherFirstRun extends React.Component {
    state = {
        dataSource: [],
        place: null
    }

    handleSubmit = (e) => {
        e.preventDefault()
        
        // const queryParams = parseQueryString()
        const { form } = this.props
        // const { email, password, confirmPassword } = form.getFieldsValue(["email", "password", "confirmPassword"])
    
        form.validateFields((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values)

            message.warning("Coming Soon!")
    
            // this.setState({
            //     ...this.state,
            //     isLoading: true
            // })
    
            // axios.post(API_URLS.accounts.resetPassword, {
            //     email,
            //     password,
            //     confirmPassword,
            //     code: queryParams.code
            // }, {
            //     headers: {
            //         "Authorization": `Bearer ${this.props.authToken}`
            //     }
            // })
            // .then(function (response) {
            //     this.setState({
            //         ...this.state,
            //         isLoading: false,
            //         success: true
            //     })
    
            //     message.success(MESSAGES.success.create)
            // }.bind(this))
            // .catch(function (error) {
            //     console.log(error)
    
            //     this.setState({
            //         ...this.state,
            //         isLoading: false
            //     })
    
            //     message.error(MESSAGES.error.default)
            // }.bind(this))
          }
        })
      }

    _handleFormChange(name, value) {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                [name]: value
            }
        })
    }

    // Function takes strings or arrays, converts strings back to arrays
    _handleFormChangeBulk(names, values) {
        const newFormData = {
            ...this.state.formData
        }
        
        names.map((name, index) => {
            const value = values[index]

            newFormData[name] = value
        })

        this.setState({
            ...this.state,
            formData: newFormData
        }, () => {
            console.log("State Update", this.state, newFormData)

            this.props.form.validateFields(['address'], { force: true })
        })
    }

    _validateAddress = (rule, value, callback) => {
        if (this.state.formData && this.state.formData.place) {
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
            this._handleFormChangeBulk(
                ["address", "mapId", "place"],
                [null, null, null]
            )
        }
    }

    _addressSelect = value => {  
        const { dataSource } = this.state
            , place = dataSource.find(item => item.id == value)

        this._handleFormChangeBulk(
            ["address", "mapId", "place"],
            [place.description, place.place_id, place]
        )
    }

    _onSubmit = () => this.setState({...this.state, formSubmitted: true})
     
    render() {
        const { dataSource } = this.state
        
        const { getFieldDecorator, getFieldsError } = this.props.form

        const renderPlacesOption = (item) => {
            return (
              <Option key={item.id}>
                {item.description}
              </Option>
            )
        }

        return (
            <div className="container marginTop-30">
                <div className="card event-details">
                    <h3>Teacher First Run Experience</h3>

                    <Row gutter={32}>
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Name of your classroom"
                            >
                                {getFieldDecorator('classroomName', {
                                    rules: [{required: true, message: 'Please choose a classroom name!'}],
                                })(
                                    <Input
                                        placeholder="grade 3 math"
                                        onChange={(e) => this._handleFormChange("classroomName", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>

                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Do you use Google Classroom?"
                            >
                                {getFieldDecorator('googleClassroom', {
                                    rules: [{required: false}],
                                })(
                                    <RadioGroup
                                        onChange={(e) => this._handleFormChange("googleClassroom", e.target.value)}
                                    >
                                        <Radio style={radioStyle} value={0}>No</Radio>
                                        <Radio style={radioStyle} value={1}>Yes</Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Divider style={{ marginTop: 30 }}>
                        School Information
                    </Divider>

                    <Row gutter={32}>
                        {/* <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Full name of your School"
                            >
                                {getFieldDecorator('schoolFullName', {
                                    rules: [{required: true, message: "Please provide your school's full name!"}],
                                })(
                                    <Input
                                        placeholder="Bayview Secondary School"
                                        onChange={(e) => this._handleFormChange("schoolFullName", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col> */}
                        
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Full name and address"
                            >
                                {getFieldDecorator('address', {
                                        rules: [
                                            {required: true, message: 'Please choose a location!'},
                                            {validator: this._validateAddress}
                                        ],
                                })(
                                    <AutoComplete
                                        dataSource={
                                            dataSource.map(renderPlacesOption).concat([
                                                <Option disabled key="all" className="show-all">
                                                    <img src={POWERED_BY_GOOGLE} style={{ height: 15 }} />
                                                </Option>,
                                            ])
                                        }
                                        onSelect={this._addressSelect}
                                        onSearch={this._addressAutoComplete}
                                        onChange={(value) => {
                                            // const { dataSource } = this.state
                                            //     , findPlace = dataSource.find(item => item.id == value)

                                            // if (findPlace) {
                                            //     this._handleFormChange("address", findPlace.description)
                                            // } else {
                                            //     this._handleFormChange("address", value)
                                            // }
                                        }}
                                        style={{ width: "100%" }}
                                    >
                                        <Input
                                            prefix={<Icon type="environment" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="10077 Bayview Ave, Richmond Hill, ON L4C 2L4"
                                            autoComplete="off"
                                        />
                                    </AutoComplete>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    
                    <Row gutter={32}>
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="First day of school this year"
                            >
                                {getFieldDecorator('firstDayOfSchool', {
                                    rules: [{ required: true, message: 'Please choose the date for the first day of school this year' }],
                                })(
                                    <DatePicker
                                        className="wide"
                                        format={dateStringFormat.replace('T', ' ')}
                                        onChange={(date, dateString) => {
                                            this._handleFormChange("firstDayOfSchool", dateString.split(' ').join('T'))
                                        }}
                                        placeholder="Click to choose"
                                    />
                                )}
                            </FormItem>
                        </Col>

                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Last day of school this year"
                            >
                                {getFieldDecorator('lastDayOfSchool', {
                                    rules: [{ required: true, message: 'Please choose the date for the last day of school this year' }],
                                })(
                                    <DatePicker
                                        className="wide"
                                        format={dateStringFormat.replace('T', ' ')}
                                        onChange={(date, dateString) => {
                                            this._handleFormChange("lastDayOfSchool", dateString.split(' ').join('T'))
                                        }}
                                        placeholder="Click to choose"
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={32}>
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Website"
                            >
                                {getFieldDecorator('schoolWebsite', {
                                    rules: [{required: false}],
                                })(
                                    <Input
                                        prefix={<Icon type="global" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="https://google.com"
                                        onChange={(e) => this._handleFormChange("schoolWebsite", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>

                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label={
                                    <span>                                    
                                        <Tooltip placement="left" title="To send safe arrival information to your school admin from parents using the mobile app">
                                            E-mail address <Icon type="info-circle" />
                                        </Tooltip>
                                    </span>
                                }
                            >
                                {getFieldDecorator('schoolAdminEmail', {
                                    rules: [{required: false}],
                                })(
                                    <Input
                                        placeholder="info@test.com"
                                        onChange={(e) => this._handleFormChange("schoolAdminEmail", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Divider style={{ marginTop: 30 }}>
                        School's Principal
                    </Divider>

                    <Row gutter={32}>
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Full name"
                            >
                                {getFieldDecorator('principalFullname', {
                                    rules: [{ required: true, message: "Please provide the principal's fullname" }],
                                })(
                                    <Input
                                        placeholder="John Smith"
                                        onChange={(e) => this._handleFormChange("principalFullname", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>

                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="E-mail address"
                            >
                                {getFieldDecorator('principalEmail', {
                                    rules: [{ required: true, message: "Please provide the principal's email address" }],
                                })(
                                    <Input
                                        placeholder="info@test.com"
                                        onChange={(e) => this._handleFormChange("principalEmail", e.target.value)}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Button
                        type="primary"
                        size="large" style={{ marginTop: 15 }}
                        // disabled={hasErrors(getFieldsError())}
                        htmlType="submit"
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        )
    }
}

export default Form.create()(TeacherFirstRun)