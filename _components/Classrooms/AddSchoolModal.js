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
import InputMask from 'react-input-mask';

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'

import moment from 'moment'
const dateFormat = "YYYY-MM-DD"
const dateStringFormat = "YYYY-MM-DDTHH:mm:00"
const timePickerConfigs = { format: 'h:mm a', use12Hours: true, minuteStep: 15 }


// Antd
import { Button, Modal, Divider, message, DatePicker } from 'antd'
const confirm = Modal.confirm
import { Form, Input, InputNumber, AutoComplete, Select } from 'antd'
const Option = Select.Option
const FormItem = Form.Item
import { Row, Col } from 'antd'
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

// Messages
import MESSAGES from '../../_data/messages'

// Misc
import ContentLayout from '../ContentLayout'
import POWERED_BY_GOOGLE from '../../img/powered_by_google.png'

import MapComponent from './MapComponent';

const createArrayFromRange = (from, to) => {
	const arr = []
	for (let i = from; i <= to; i++) {
		arr.push(i)
    }

	return arr
}
const geocoder = new google.maps.Geocoder;
class AddSchoolModal extends React.Component {
    state = {
        dataSource: [],
        place: null,
        mapLocation: {lat: 43.761, lng: -79.411},
        showMap: false,
    }

    componentDidMount() {
      this.delayedShowMarker()
    }

    componentWillReceiveProps(nextProps) {
        const { schoolToEdit } = nextProps;
        if (this.props.visible !== nextProps.visible) {
          if(schoolToEdit) {
            this.props.form.setFieldsValue({
                name: schoolToEdit.name,
                address: schoolToEdit.address,
                "mapId": schoolToEdit.mapId,
                "mainEmail": schoolToEdit.email,
                "startGrade": schoolToEdit.startGrade,
                "endGrade": schoolToEdit.endGrade,
                "principalName": schoolToEdit.principalName,
                "safeArrivalEmail": schoolToEdit.safeArrivalEmail,
                "safeArrivalAdminName": schoolToEdit.safeArrivalAdminName,
                "yearStartDate": moment(schoolToEdit.yearStartDate),
                "yearEndDate": moment(schoolToEdit.yearEndDate),
                "phoneNumber": schoolToEdit.phoneNumber
            })
            this.setState({mapLocation: {lat: 43.761, lng: -79.411}, showMap: true})
          } else {
            this.props.form.resetFields();
          }
            // uncoment when server done
            // geocoder.geocode({'placeId': schoolToEdit.mapId}, (results, status) => {
            //   if (status === 'OK'){
            //     const adress = results[0].geometry.location;
            //     const adressLong = adress.lng();
            //     const adressLat = adress.lat();
            //     const mapLocation = {lat: adressLat, lng: adressLong};
            //     this.setState({mapLocation, isMarkerShown: true, showMap: true, place: {}});
            //   };
            // });
        }
    }

    validateThenCreateSchool = (e) => {
        e.preventDefault()

        this.props.form.validateFields((err, values) => {
            if (err) return
            const { dataSource } = this.state
                , place = dataSource.find(item => item.id == values.address)

            this.addSchool()
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
                , options = { input: value, componentRestrictions: {country: 'CA'}}

            service.getPlacePredictions(options, (predictions, status) => {
                if (status != google.maps.places.PlacesServiceStatus.OK) {

                return
                }

                this.setState({
                    ...this.state,
                    dataSource: predictions
                })
            })
        } else {
          this.setState({showMap: false});
        }
    }

    _addressSelect = (value) => {
        const { dataSource } = this.state
            , place = dataSource.find(item => item.id == value)

        geocoder.geocode({'placeId': place.place_id}, (results, status) => {
          if (status === 'OK'){
            const adress = results[0].geometry.location;
            const adressLong = adress.lng();
            const adressLat = adress.lat();
            const mapLocation = {lat: adressLat, lng: adressLong};
            this.setState({mapLocation, isMarkerShown: true, showMap: true});
          };
        });
        this.setState({
            ...this.state,
            place,
        }, () => {
            this.props.form.validateFields(['address'])
            console.log("set placedescription")
            this.props.form.setFieldsValue({
                "placedescription": place.description
            })
        })
    }

    addSchool = () => {
        const { schoolToEdit, editMethods } = this.props
        this.props.form.validateFields((err, values) => {
            if (err) return
            editMethods.before()
            axios[schoolToEdit ? "put" : "post"](API_URLS.school.create + (schoolToEdit ? `/${schoolToEdit.id}` : ""), {
                "name": values.name,
                "address": this.state.place.description || schoolToEdit.address,
                "mapId": values.address,
                "email": values.mainEmail,
                "startGrade": values.startGrade,
                "endGrade": values.endGrade,
                "principalName": values.principalName,
                "safeArrivalEmail": values.safeArrivalEmail,
                "safeArrivalAdminName": values.safeArrivalAdminName,
                "yearStartDate": values.yearStartDate.format(dateStringFormat),
                "yearEndDate": values.yearEndDate.format(dateStringFormat),
                "phoneNumber": values.phoneNumber
            }, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                },
            })
            .then(function (response) {
                editMethods.success();
            }.bind(this))
            .catch(function (error) {
                console.log(error)

                editMethods.error()
            }.bind(this))
        })
    }


    delayedShowMarker = () => {
      setTimeout(() => {
        this.setState({ isMarkerShown: true })
      }, 3000)
    }

    handleMarkerClick = () => {
      this.setState({ isMarkerShown: false })
      this.delayedShowMarker()
    }

    renderSelectOptions = () => [
      <Option value='-1'>JK</Option>,
      <Option value='0'>SK</Option>,
      <Option value='1'>1</Option>,
      <Option value='2'>2</Option>,
      <Option value='3'>3</Option>,
      <Option value='4'>4</Option>,
      <Option value='5'>5</Option>,
      <Option value='6'>6</Option>,
      <Option value='7'>7</Option>,
      <Option value='8'>8</Option>,
      <Option value='9'>9</Option>,
      <Option value='10'>10</Option>,
      <Option value='11'>11</Option>,
      <Option value='12'>12</Option>
    ];

    render() {
        const { visible, confirmLoading, schoolToEdit } = this.props // State variables
            , { createClassroom, toggleModal } = this.props // Methods
            , { getFieldDecorator } = this.props.form
            , { dataSource, place, mapLocation, isMarkerShown, showMap } = this.state
            , regularMode = this.props.mode && this.props.mode === "regular"
        const FormComp =
            <Form
                onSubmit={this.validateThenCreateSchool}
            >
                <FormItem label='Name'>
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: 'Please provide the name of the school.',
                        }],
                    })(
                        <Input placeholder="Bayview Secondary School" />
                    )}
                </FormItem>
                
                
                
                
                
                <FormItem
                    label="Location Address"
                >
                    {getFieldDecorator('address', {
                            rules: [
                                {required: true, message: 'Please choose a location.'},
                                {validator: this._validateAddress}
                            ],
                            validateTrigger: null
                    })(
                        <AutoComplete
                            dataSource={
                                dataSource.map((item) =>
                                    <Option key={item.id}>
                                        {item.description}
                                    </Option>
                                ).concat([
                                    <Option disabled key="all" className="show-all">
                                        <img src={POWERED_BY_GOOGLE} style={{ height: 15 }} />
                                    </Option>
                                ])
                            }
                            onSelect={this._addressSelect}
                            onSearch={this._addressAutoComplete}
                            onChange={(value) => {
                                const findPlace = dataSource.find(item => item.id == value)
                                let address = ""
                                if (findPlace) {
                                    this.props.form.setFieldsValue({
                                        address: findPlace.description
                                    })
                                } else {
                                    this.props.form.setFieldsValue({
                                        address: value
                                    })
                                }

                                this.props.form.validateFields(['address'])
                            }}
                        >
                            <Input
                                placeholder="start typing..."
                                autoComplete="off"
                            />
                        </AutoComplete>
                    )}
                </FormItem>
                {showMap &&
                  <MapComponent
                    isMarkerShown={this.state.isMarkerShown}
                    onMarkerClick={this.handleMarkerClick}
                    location={mapLocation}
                    isMarkerShown={isMarkerShown}
                  />
                }

                
                
                
                
                
                

                <FormItem label='Principal Name'>
                    {getFieldDecorator('principalName', {
                        rules: [{
                            required: true,
                            message: 'Please provide the name of the principal',
                        }],
                    })(
                        <Input placeholder="John Smith" />
                    )}
                </FormItem>

                <FormItem label='Place Description' style={{ display: "none" }}>
                    {getFieldDecorator('placedescription', {
                        rules: [{
                            required: false
                        }]
                    })(
                        <Input placeholder="John Smith" />
                    )}
                </FormItem>

                <Row gutter={32}>
                    <Col xs={12} md={12} lg={12}>
                        <FormItem label='Grade'>
                            {getFieldDecorator('startGrade', {
                                rules: [
                                  {
                                    required: true,
                                    message: 'Please enter the minimum grade offered at the school',
                                  },
                                  {
                                    validator: (rule, value, callback) => {
                                      const formValues = this.props.form.getFieldsValue();
                                      const {endGrade, startGrade} = formValues;
                                      if (parseFloat(startGrade) > parseFloat(endGrade)) {
                                        callback('Start grade must be less then end grade')
                                      }
                                      callback();
                                    },
                                  }
                                ],
                            })(
                            <Select>
                              {this.renderSelectOptions()}
                            </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col xs={12} md={12} lg={12}>
                        <FormItem label='To Grade'>
                            {getFieldDecorator('endGrade', {
                                rules: [{
                                    required: true,
                                    message: 'Please enter the maximum grade offered at the school',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    const formValues = this.props.form.getFieldsValue();
                                    const {endGrade, startGrade} = formValues;
                                    if (parseFloat(startGrade) > parseFloat(endGrade)) {
                                      callback('End grade must be more then start grade')
                                    }
                                    callback();
                                  },
                                }],
                            })(
                              <Select>
                                {this.renderSelectOptions()}
                              </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <FormItem label='Main Email Address'>
                    {getFieldDecorator('mainEmail', {
                        rules: [{
                            required: true,
                            message: 'Please enter the main email address for the school',
                        }],
                    })(
                        <Input placeholder="info@school.public" />
                    )}
                </FormItem>

                <Row gutter={32}>
                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="School start date"
                        >
                            {getFieldDecorator('yearStartDate', {
                                rules: [
                                    { required: true, message: 'Please choose the school start date' }
                                ],
                            })(
                                <DatePicker
                                    className="wide"
                                    showTime={false}
                                    format={dateFormat}
                                    placeholder="Click to choose"
                                />
                            )}
                        </FormItem>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="School end date"
                        >
                            {getFieldDecorator('yearEndDate', {
                                rules: [
                                    { required: true, message: 'Please choose the school end date' }
                                ],
                            })(
                                <DatePicker
                                    className="wide"
                                    showTime={false}
                                    format={dateFormat}
                                    placeholder="Click to choose"
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <FormItem label="School Main Phone Number">
                    {getFieldDecorator('phoneNumber', {
                        rules: [
                        { pattern: new RegExp(/^\(\d{3}\)\s{1}\d{3}\-\d{4}$/), message: 'Phone number is not formatted correctly' },
                        { required: true, message: 'Please enter the school main phone number.' }
                        ],
                    })(
                        <InputMask mask="(999) 999-9999" className="ant-input" placeholder="(123)456-7890"/>
                    )}
                </FormItem>

                <Divider>Safe Arrival</Divider>
                <p>(Where student arrival messages from parents are received.)</p>

                <FormItem label="Admin’s Email:">
                    {getFieldDecorator('safeArrivalEmail', {
                        rules: [{
                            required: false
                        }],
                    })(
                        <Input placeholder="info@school.public" />
                    )}
                </FormItem>

                <FormItem label="Admin's Full Name">
                    {getFieldDecorator('safeArrivalAdminName', {
                        rules: [{
                            required: false
                        }],
                    })(
                        <Input placeholder="John Smith" />
                    )}
                </FormItem>

                {!regularMode &&
                    <div className="alignRight">
                        <Button size='large' style={{ marginRight: 5 }} onClick={toggleModal.bind(this, false)} disabled={confirmLoading}>
                            Cancel
                        </Button>

                        <Button size='large' type="primary" htmlType="submit" loading={confirmLoading}>
                            {schoolToEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                }
            </Form>
        if (regularMode)
            return <div style={{ textAlign: "left" }}>{FormComp}</div>
        else
            return (
                <Modal
                    visible={visible}
                    title={schoolToEdit ? 'Edit school' : 'Create a new school'}
                    footer={null}
                    onCancel={() => {
                      this.props.toggleModal(false)
                      this.setState({mapLocation: {lat: 43.761, lng: -79.411}, showMap: false});
                    }}
                >
                    {FormComp}
                </Modal>
            )
    }
}


export const connected = compose(
        connect(
            (state) => ({
                auth: state.auth,
            }),
        )
    )(Form.create()(AddSchoolModal))

export const form = Form.create()(AddSchoolModal)
