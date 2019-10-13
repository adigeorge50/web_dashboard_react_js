import React, {Fragment} from 'react'

// Antd
import { Icon } from 'antd'
import { Row, Col } from 'antd'
import { Form, Input, AutoComplete, Button, Radio } from 'antd'
const FormItem = Form.Item
import { DatePicker } from 'antd'
import { TimePicker } from 'antd'
import { Select } from 'antd'
const { Option } = Select
import { Checkbox } from 'antd'
import { Divider } from 'antd'
import { InputNumber } from 'antd'
const { TextArea } = Input

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'

// Misc
import moment from 'moment'
import POWERED_BY_GOOGLE from '../../img/powered_by_google.png'

const dateStringFormat = "YYYY-MM-DDTHH:mm:00"

class Step2 extends React.Component {
    state = {
        additions: {
            payment: false,
            notifications: false
        },
        dataSource: [],
        place: null,
        defaultDropDownValues: [],
    }

    _setFieldValues = (nextProps) => {
        const formData = nextProps ? nextProps.formData : this.props.formData
        const timePickerConfigs = { format: 'h:mm a', use12Hours: true, minuteStep: 15 }
        if (!nextProps || formData !== this.props.formData) {
            this.props.form.setFieldsValue({
                tripName: formData.tripName,
                address: formData.address ? formData.address : undefined,
                paymentAmount: formData.amount ? formData.amount : undefined,
                // classroom: formData.classroomIds ? formData.classroomIds.split(',') : undefined,
                classroom: formData.classroomIds ? formData.classroomIds.split(',').map(id => Number(id)) : undefined,
                reminderTime: formData.reminderTime ? formData.reminderTime : undefined,
                notifyMessage: formData.notifyMessage ? formData.notifyMessage : undefined,
                departAt: formData.departAt ? moment(formData.departAt, dateStringFormat) : moment('09:00', timePickerConfigs.format),
                arriveOn: formData.arriveOn ? moment(formData.arriveOn, dateStringFormat) : moment('15:00', timePickerConfigs.format),
                dueDate: formData.dueDate ? moment(formData.dueDate, dateStringFormat) : moment('15:00', timePickerConfigs.format),
                depositTo: formData.depositMethod,
                enableWebLinks: formData.enableWebLinks ? formData.enableWebLinks : null,
                weblinks: formData.weblinks ? formData.weblinks.split(',').join('\n'): '',
            })
        }

        if ((!nextProps && formData.place) || (nextProps && nextProps.place !== formData.place)) {
            this.setState({
                ...this.state,
                place: formData.place
            })
        }
    }

    componentDidMount() {
        this._setFieldValues();
        this.setSchoolName();
        // this.setDefaultValues();
    }

    setSchoolName = () => {
        let multipleClassrooms = this.props.formData.classroomIds ? this.props.formData.classroomIds.split(',').map(id => Number(id)) : []
        if(multipleClassrooms.length > 1) {
            this.setUpdatedDeposit('multiple')
        } else{
            if(multipleClassrooms.length === 1){
                let classIndex = this.props.classrooms.findIndex((key, index) => {
                    if (key.id === multipleClassrooms[0]) return key
                })
                this.setUpdatedDeposit(classIndex)
            }else{
                this.setUpdatedDeposit(0)
            }
        }
    }

    setDefaultValues = () => {
        let x = []
        this.props.formData.ClassroomList.length ? (
            x = this.props.formData.ClassroomList.map(key => {
                return key.classroomId
            }) ) : []
        this.setState({
            ...this.state,
            defaultDropDownValues: x,
        })
        console.log('hellohi' , x);
    }

    setUpdatedDeposit = (value) => {
        let updatedDeposit = this.props.depositMethods.map(key => {
            if(key.id === 2) {
                key.schoolName = this.props.fullName
            }else {
                if(value === 'multiple') {
                    key.schoolName = 'Your School'
                } else{
                    key.schoolName = this.props.classrooms[value].schoolName
                }
            }
            return key
        })

        this.setState({
            ...this.state,
            depositMethods: updatedDeposit,
        })
    }

    componentWillReceiveProps(nextProps) {
        this._setFieldValues(nextProps)
    }

    _additionsChanged(additionType, e) {
        this.setState({
            ...this.state,
            additions: {
                ...this.state.additions,
                [additionType]: e.target.checked
            }
        })
    }

    _validateDates = (rule, value, callback) => {
        const { formData } = this.props
            , departAt = (rule.field == 'departAt') ? value : formData.departAt
            , arriveOn = (rule.field == 'arriveOn') ? value : formData.arriveOn

        if (moment(arriveOn).isAfter(departAt)) {
          callback()

          return
        }

        callback(
            (rule.field == 'arriveOn') ? 'Return should be after departure date & time' : 'Departure should be before return date & time'
        )
    }

    _validateAddress = (rule, value, callback) => {
        const { place } = this.state
            , { formData } = this.props

        if (formData.address && formData.mapId) {
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
            this.props._handleFormChangeBulk(
                ["address", "mapId", "place"],
                [null, null, null]
            )
        }
    }

    _addressSelect = (value) => {
        const { dataSource } = this.state
            , place = dataSource.find(item => item.id == value)
        this.setState({
            ...this.state,
            place
        })

        console.log("adrewedwedwedw", place)

        this.props._handleFormChangeBulk(
            ["address", "mapId", "place"],
            [place.description, place.place_id, place]
        )
    }

    getNotificationPeriods = (toDate) => {
      const formatedToDate = moment(toDate);
      const difference = formatedToDate.diff(moment(), 'minutes');

      const reminderTimeInMinutes = [5, 10, 15, 30, 60, 120, 180, 240, 300,
        360, 420, 480, 540, 600, 660, 720, 1080, 1440, 2880,
        4320, 5760, 10080, 20160]
        .filter((time) => time < difference);

      return reminderTimeInMinutes.map(time => {
        if (time < 60) {
          return <Option value={time}>{`${time} minute(s)`}</Option>
        }
        if (time < 1440) {
          return <Option value={time}>{`${time / 60} hour(s)`}</Option>
        }
        if (time < 10080) {
          return <Option value={time}>{`${time / 60 / 24} day(s)`}</Option>
        }
        return <Option value={time}>{`${time / 60 / 24 / 7} week(s)`}</Option>
      })
    }

    _handleWebLinksChange = (value) => {
        this.props._handleFormChange("weblinks", value.replace(/\n/g, ","))
    }

    _handleClassRoomChange = (value) => {
        let classIndex
        if(value.length > 1) {
            classIndex = 'multiple'
        }else{
            if(value.length === 0){
                classIndex = 0
            } else{
            classIndex = this.props.classrooms.findIndex((key, index) => {
                if (key.id === value[0]) return key.id
            })
        }
        }

        let updatedDeposit = this.props.depositMethods.map(key => {
            if(key.id === 0) {
                if(classIndex === 'multiple') {
                    key.schoolName = 'Your School'
                }else{
                    key.schoolName = this.props.classrooms[classIndex].schoolName

                }
            }
            return key
        })

        this.setState({
            ...this.state,
            depositMethods: updatedDeposit,
        })

        this.props.form.setFieldsValue({
            classroom: value
        })
        
        this.props._handleFormChange("classroomIds", value.join())
    }
    
    render() {
        const { additions, dataSource, place, defaultDropDownValues } = this.state
            , { isLoading, filePreview, _handleFileChange, classrooms, depositMethods, formData, fullName } = this.props
            , { getFieldDecorator } = this.props.form
        
        console.log('objectredddd', defaultDropDownValues);

        const timePickerConfigs = { format: 'h:mm a', use12Hours: true, minuteStep: 15 }
        const renderPlacesOption = (item) => {
            const { structured_formatting: formattedString } = item
            return (
              <Option key={item.id}>
                {item.description}
              </Option>
            )
        }
        var placeholder = "https://www.atschooltoday.net\nhttps://goo.gl/maps/B2Xy4EEXN2AF2gDS8\nhttps://www.facebook.com/your-classroom-link"
        return (
            <Form layout='vertical'>
                <Divider>
                    Time & Date
                </Divider>

                <Row gutter={32}>
                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="Trip Name"
                        >
                            {getFieldDecorator('tripName', {
                                rules: [{required: true, message: 'Please choose a trip name!'}],
                            })(
                                <Input
                                    placeholder="input placeholder"
                                    onChange={(e) => this.props._handleFormChange("tripName", e.target.value)}
                                />
                            )}
                        </FormItem>

                        <FormItem
                            label="Location Address"
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
                                        const { dataSource } = this.state
                                            , findPlace = dataSource.find(item => item.id == value)

                                        if (findPlace) {
                                            this.props._handleFormChangeBulk(
                                                ["address", "mapId"],
                                                [findPlace.description, findPlace.id]
                                            )
                                        } else {
                                            this.props._handleFormChangeBulk(
                                                ["address", "mapId"],
                                                [value, null]
                                            )
                                        }
                                    }}
                                >
                                    <Input
                                        placeholder="input placeholder"
                                        autoComplete="off"
                                    />
                                </AutoComplete>
                            )}
                        </FormItem>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="Departure Date & Time"
                        >
                            {getFieldDecorator('departAt', {
                                rules: [
                                    { required: true, message: 'Please choose a departure date & time' },
                                    { validator: this._validateDates }
                                ],
                            })(
                                <DatePicker
                                    className="wide"
                                    showTime={{...timePickerConfigs, defaultValue: moment('09:00', timePickerConfigs.format)}}
                                    format={dateStringFormat.replace('T', ' ')}
                                    onChange={(date, dateString) => {
                                        const splittedDate = dateString.split(' ')
                                        if (!formData.arriveOn) {
                                            this.props._handleFormChangeBulk(
                                                ["departAt", "arriveOn"],
                                                [splittedDate.join('T'), `${splittedDate[0]}T15:00:00`]
                                            )
                                        } else {
                                            if (moment(splittedDate.join('T')).isAfter(formData.arriveOn)) {
                                                this.props._handleFormChangeBulk(
                                                    ["departAt", "arriveOn"],
                                                    [splittedDate.join('T'), `${splittedDate[0]}T15:00:00`]
                                                )
                                            } else {
                                                this.props._handleFormChange("departAt", splittedDate.join('T'))
                                            }
                                        }
                                    }}
                                    placeholder="Click to choose"
                                />
                            )}
                        </FormItem>

                        <FormItem
                            label="Return Date & Time"
                        >
                            {getFieldDecorator('arriveOn', {
                                rules: [{ required: true, message: 'Please choose a return date & time' }, { validator: this._validateDates }],
                            })(
                                <DatePicker
                                    className="wide"
                                    showTime={{...timePickerConfigs, defaultValue: moment('15:00', timePickerConfigs.format)}}
                                    format={dateStringFormat.replace('T', ' ')}
                                    onChange={(date, dateString) => {
                                        this.props._handleFormChange("arriveOn", dateString.split(' ').join('T'))
                                    }}
                                    placeholder="Click to choose"
                                />
                            )}
                        </FormItem>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <FormItem
                            label="Due Date & Time"
                        >
                            {getFieldDecorator('dueDate', {
                                rules: [
                                    { required: true, message: 'Please choose a due date & time' },
                                ],
                            })(
                                <DatePicker
                                    className="wide"
                                    showTime={timePickerConfigs}
                                    format={dateStringFormat.replace('T', ' ')}
                                    onChange={(date, dateString) => {
                                        this.props._handleFormChange("dueDate", dateString.split(' ').join('T'))
                                    }}
                                    placeholder="Click to choose"
                                />
                            )}
                        </FormItem>

                        {/* <Checkbox
                            checked={formData.volunteerRequest}
                            onChange={(e) => this.props._handleFormChange("volunteerRequest", e.target.checked)}
                        >
                            Ask for parent/guardian volunteers
                        </Checkbox> */}

                        <FormItem
                            label="Classroom"
                            className="marginTop-15"
                        >
                            {console.log('classobject', this.state.defaultDropDownValues)}
                            {console.log('classobject2', this.props.formData)}

                            {getFieldDecorator('classroom', {
                                rules: [{ required: true, message: 'Please choose a classroom!' }],
                            })(
                                <Select
                                    mode='multiple'
                                    style={{ width: 300 }}
                                    // optionLabelProp="label"
                                    placeholder="Please select a value"
                                    onChange={(value) => this._handleClassRoomChange(value)}
                                >
                                    {classrooms.map((classroom) => (
                                        <Option key={`classroom-${classroom.id}`} value={classroom.id}>
                                            {classroom.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Divider>
                    <Checkbox
                        checked={formData.requiresPayment}
                        onChange={(e) => this.props._handleFormChange("requiresPayment", e.target.checked)}
                    >
                        Payment
                    </Checkbox>
                </Divider>

                {formData.requiresPayment &&
                <div>
                    <FormItem
                        label="Amount"
                        // className="marginTop-15"
                    >
                        {getFieldDecorator('paymentAmount', {
                            rules: [
                                { pattern: new RegExp('^[-+]?[0-9]*\.?[0-9]+$'), message: 'This has to be larger than 0!' },
                                { required: true, message: 'Please provide an amount' }
                            ]
                        })(
                            <InputNumber
                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={(value) => this.props._handleFormChange("amount", value)}
                                min={0}
                            />
                        )}
                    </FormItem>

                    <FormItem
                        label="Deposit To"
                        className="marginTop-15"
                    >
                        {getFieldDecorator('depositTo', {
                            rules: [
                                { required: true, message: 'Please choose an account to deposit to' }
                            ]
                        })(
                            <Select
                                style={{ width: '80%', maxWidth: '400px' }}
                                onChange={(value) => this.props._handleFormChange("depositMethod", value)}
                            >
                                {depositMethods.map((depositMethod) => (
                                    <Option key={`depositMethod-${depositMethod.id}`} value={depositMethod.id}>
                                        {depositMethod.schoolName + ' bank account'}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                </div>
                }

                <Divider>
                    <Checkbox
                        checked={formData.notify}
                        onChange={(e) => this.props._handleFormChange("notify", e.target.checked)}
                    >
                        Notifications
                    </Checkbox>
                </Divider>

                {formData.notify &&
                <div>
                    <Row gutter={32}>
                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Reminder Time"
                            >
                                {getFieldDecorator('reminderTime', {
                                    rules: [{
                                        required: true,
                                        message: 'Please choose a reminder time',
                                    }],
                                })(
                                    <Select
                                        style={{ width: 120 }}
                                        onChange={(value) => this.props._handleFormChange("reminderTime", value)}
                                        // defaultValue={formData.reminderTime ? formData.reminderTime : null}
                                    >
                                        <Option disabled selected value={null}></Option>
                                        {this.getNotificationPeriods(formData.departAt)}
                                    </Select>
                                )}
                            </FormItem>

                            <div>
                                <Checkbox
                                    checked={formData.notifyByEmail}
                                    onChange={(e) => this.props._handleFormChange("notifyByEmail", e.target.checked)}
                                >
                                    By Email
                                </Checkbox>
                            </div>

                            <div className="marginTop-10">
                                <Checkbox
                                    checked={formData.notifyByPush}
                                    onChange={(e) => this.props._handleFormChange("notifyByPush", e.target.checked)}
                                >
                                    By Mobile App
                                </Checkbox>
                            </div>
                        </Col>

                        <Col xs={24} md={12} lg={12}>
                            <FormItem
                                label="Notification Message"
                            >
                                {getFieldDecorator('notifyMessage', {
                                    rules: [{
                                        required: formData.notify,
                                        message: 'Please provide a message for the notifications',
                                    }],
                                })(
                                    <TextArea
                                        rows={4}
                                        onChange={(e) => this.props._handleFormChange("notifyMessage", e.target.value)}
                                        // defaultValue={formData.notifyMessage}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </div>
                }
                <Divider>
                    <Checkbox
                        checked={formData.enableWebLinks}
                        onChange={(e) => this.props._handleFormChange("enableWebLinks", e.target.checked)}
                    >
                        Web Links
                    </Checkbox>
                </Divider>
                {
                  formData.enableWebLinks &&
                  <Row gutter={32}>
                    <Col xs={24} md={24} lg={24}>
                            <FormItem
                                label="Web Links (Enter each Web link on a separate line)"
                            >
                                {getFieldDecorator('weblinks', {
                                    rules: [{
                                        required: formData.enableWebLinks,
                                        message: 'Please provide a web links',
                                    }],
                                })(
                                    <TextArea
                                        rows={4}
                                        onChange={(e) => this._handleWebLinksChange(e.target.value)}
                                        placeholder={placeholder}
                                    />
                                )}
                            </FormItem>
                        </Col>
                  </Row>
                }
            </Form>
        )
    }
}

export default Form.create()(Step2)
