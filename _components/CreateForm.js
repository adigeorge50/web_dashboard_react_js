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

import moment from 'moment'

// Antd
import { Steps } from 'antd'
const Step = Steps.Step
import { Button, Icon } from 'antd'
const ButtonGroup = Button.Group
import { message } from 'antd'
import { Spin } from 'antd'

// Drag & Drop
import interact from 'interactjs'
import ICONS_STUDENT_NAME from '../img/CreateForm/student_name.svg'

// Lang
import LANGS from '../_langs/index'
const dateStringFormat = "YYYY-MM-DDTHH:mm:SS"

// Steps
import Step1 from './CreateForm/Step1'
import Step2 from './CreateForm/Step2'
import Step3 from './CreateForm/Step3'
import Step4 from './CreateForm/Step4'

import sampleFormData from './CreateForm/sampleFormData'

const dev = false
    , EDIT_PATH = "/form/edit/:id"

// Set depart & arrival time defaults



const departAt = new Date()
departAt.setHours(9)
departAt.setMinutes(0)
departAt.setSeconds(0)
departAt.setMilliseconds(0)

const arriveOn = new Date()
arriveOn.setHours(15)
arriveOn.setMinutes(0)
arriveOn.setSeconds(0)
arriveOn.setMilliseconds(0)

const dueDate = new Date()
dueDate.setSeconds(0)
dueDate.setMilliseconds(0)
class CreateFormComponent extends React.Component {
    constructor(props) {
        super(props)

        const editMode = props.match.path === EDIT_PATH

        this.formDefaults = {
            "name": "",
            "formType": null,
            "tripName": "",
            "address": null,
            "mapId": null,
            "departAt": moment(departAt).format(dateStringFormat),
            "arriveOn": moment(arriveOn).format(dateStringFormat),
            "dueDate": moment(dueDate).format(dateStringFormat),
            // "classroomId": null,
            "volunteerRequest": false,
            "requiresPayment": false,
            "depositMethod": null,
            "depositMethodName": null,
            "amount": null,
            "notify": false,
            "reminderTime": null,
            "notifyByEmail": false,
            "notifyByPush": false,
            "notifyMessage": null,
            "templateId": null,
            "fields": [],
            "pages": [
              {
                "id": 0,
                "number": 0,
                "base64Image": ""
              }
            ]
        }

        // Set default form data
        this.state = {
            editMode,
            formID: editMode ? parseInt(props.match.params.id) : undefined,
            step: editMode ? 2 : 1,
            classrooms: [],
            isLoading: {
                1: false,
                editMode,
                overall: true
            },
            formData: dev ? sampleFormData : this.formDefaults
        }

        this._stepRefs = {}
    }

    _handleFormChange(name, value) {
        // console.log("Update", name, value)
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                [name]: value
            }
        }, () => {
            console.log("State Update", this.state.formData)
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
            console.log("State Update", this.state.formData)
        })
    }

    _handleFieldTypes(fieldTypesArray) {
        this.setState({
            ...this.state,
            fieldTypes: fieldTypesArray
        })
    }

    componentDidMount() {
        const { editMode } = this.state

        Promise.all([
            this._getClassrooms(),
            this._getDepositMethods(),
            this._getFormTemplates()
        ]).then(
            () => {
                this.setState({
                    ...this.state,
                    isLoading: {
                        ...this.state.isLoading,
                        overall: false
                    }
                })
            }
        )

        if (editMode) {
            axios.get(`${API_URLS.form.get}/${this.props.match.params.id}`, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function ({data}) {
                this.setState({
                    ...this.state,
                    formData: {
                      ...data,
                      arriveOn: moment.utc(data.arriveOn, 'YYYY-MM-DDTHH:mm:ss').local().format('YYYY-MM-DDTHH:mm:ss'),
                      departAt: moment.utc(data.departAt, 'YYYY-MM-DDTHH:mm:ss').local().format('YYYY-MM-DDTHH:mm:ss'),
                      dueDate: moment.utc(data.dueDate, 'YYYY-MM-DDTHH:mm:ss').local().format('YYYY-MM-DDTHH:mm:ss'),
                      pages: data.pages.sort((firstElement, secondElement) => (firstElement.number > secondElement.number) ? 1 : -1)
                      // add pages sorting
                    },
                    isLoading: {
                        ...this.state.isLoading,
                        editMode: false
                    }
                })
            }.bind(this))
            .catch(function (error) {
                console.log(error)
            })
        }
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

                resolve(false)
            })
        })
    }

    _getDepositMethods() {
        return new Promise((resolve, reject) => {
            axios.get(API_URLS.depositMethod.get, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                const { data } = response
                this.setState({
                    ...this.state,
                    depositMethods: data
                })

                resolve(true)
            }.bind(this))
            .catch(function (error) {
                console.log(error)

                resolve(false)
            })
        })
    }

    _getFormTemplates() {
        return new Promise((resolve, reject) => {
            axios.get(API_URLS.formTemplate.get, {
                headers: {
                    "Authorization": `Bearer ${this.props.auth.authToken}`
                }
            })
            .then(function (response) {
                this.setState({
                    ...this.state,
                    formTemplates: response.data
                })

                resolve(true)
            }.bind(this))
            .catch(function (error) {
                console.log(error)

                resolve(false)
            })
        })
    }

    _handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            if (event.target.value.lastIndexOf('.pdf') === -1) {
                alert('Only pdf files are allowed!')
                event.target.value = ''

                return;
            }

            if (window.FormData !== undefined) {
                const formData = new FormData()
                formData.append('File', files[0])

                this.setState({
                    ...this.state,
                    isLoading: {
                        ...this.state.isLoading,
                        1: true
                    }
                })

                axios.post(API_URLS.form.splitPDF, formData, {
                    headers: {
                        "Authorization": `Bearer ${this.props.auth.authToken}`
                    }
                })
                .then(function (response) {
                    console.log(response)

                    const { pages } = response.data
                        , imagePromises = []
                        , imageDimensions = {}

                    // Load the images and get dimensions
                    pages.map((page, index) => {
                        imageDimensions[index] = {
                            width: page.width,
                            height: page.height
                        }
                    })

                    const formDataAdditions = {
                        pages: pages.map((page, pageIndex) => {
                            return {
                                "id": pageIndex,
                                "number": pageIndex,
                                "base64Image": page.image
                            }
                        }),
                        file: files[0]
                    }
                    this.setState({
                        ...this.state,
                        filePreview: `data:image/png;base64,${response.data.pages[0].image}`,
                        isLoading: {
                            ...this.state.isLoading,
                            1: false
                        },
                        formData: this.state.formData.templateId ? {
                            ...this.formDefaults,
                            ...formDataAdditions,
                            templateId: null
                        } : {
                            ...this.state.formData,
                            ...formDataAdditions,
                            templateId: null
                        },
                        pageDimensions: imageDimensions
                    })
                }.bind(this))
                .catch(function (error) {
                    console.log(error)
                })
            } else {
                alert("This browser doesn't support HTML5 file uploads!")
            }
        }
    }

    _applyTemplate(data) {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                ...data,
                templateId: data.id,
            },
            filePreview: (data.pages && data.pages.length > 0 && data.pages[0].url) ? data.pages[0].url : this.state.filePreview
        })
    }

    _skipStep(next) {
        if (next && this._stepRefs[this.state.step]) {
            this._stepRefs[this.state.step].validateFields(function(errors, values) {
                if (errors) {
                    return
                }

                this.setState({
                    ...this.state,
                    step: next ? ++this.state.step : --this.state.step
                })
            }.bind(this))
        } else {
            this.setState({
                ...this.state,
                step: next ? ++this.state.step : --this.state.step
            })
        }
    }

    _changeLoading(step, value) {
        this.setState({
            ...this.state,
            isLoading: {
                ...this.state.isLoading,
                [step]: value
            },
        })
    }

    _finish() {
        const { formData, pageDimensions, editMode } = this.state
        const fieldsArray = formData.fields;
        const newFormData = {
          ...formData,
          arriveOn: moment.utc(moment(formData.arriveOn, 'YYYY-MM-DDTHH:mm:ss')).format('YYYY-MM-DDTHH:mm:ss'),
          dueDate: moment.utc(moment(formData.dueDate, 'YYYY-MM-DDTHH:mm:ss')).format('YYYY-MM-DDTHH:mm:ss'),
          departAt: moment.utc(moment(formData.departAt, 'YYYY-MM-DDTHH:mm:ss')).format('YYYY-MM-DDTHH:mm:ss'),
          fields: fieldsArray
        }
        this.setState({
            ...this.state,
            isLoading: {
                ...this.state.isLoading,
                4: true
            },
            formData: {
                ...formData,
                fields: fieldsArray
            }
        }, () => {
            if (!editMode)
                axios.post(API_URLS.form.submit, newFormData, {
                    headers: {
                        "Authorization": `Bearer ${this.props.auth.authToken}`
                    }
                })
                .then(function (response) {
                    this._changeLoading(4, false)
                    message.success('Record submitted!')

                    this.props.history.push('')
                }.bind(this))
                .catch(function (error) {
                    console.log(error)

                    this._changeLoading(4, false)
                    message.error('Something went wrong!')
                }.bind(this))
            else
                axios.put(API_URLS.form.submit, newFormData, {
                    headers: {
                        "Authorization": `Bearer ${this.props.auth.authToken}`
                    }
                })
                .then(function (response) {
                    console.log(response)

                    this._changeLoading(4, false)
                    message.success('Record Updated!')

                    this.props.history.push('')
                }.bind(this))
                .catch(function (error) {
                    console.log(error)

                    this._changeLoading(4, false)
                    message.error('Something went wrong!')
                }.bind(this))
        })
    }

    render() {
        const { isLoading, filePreview, step, classrooms, depositMethods, formTemplates,
                formData, fieldTypes, editMode, overall } = this.state
            , { localization } = this.props
            , LANG_STRINGS = LANGS[localization.language]

        let stepInLoading = false
        Object.keys(isLoading).map(stepKey => {
            if (isLoading[stepKey]) stepInLoading = true
        })
        
        return (
            <div className="container marginBottom-30">
                <Steps className="marginTop-30">
                    <Step
                        status={step === 1 ? "process" : "finish"}
                        title="Select Form" icon={isLoading[1] ? (<Icon type="loading" />) : (<Icon type="cloud-upload-o" />)}
                    />

                    <Step
                        status={step < 2 ? "wait" : (step === 2 ? "process" : "finish")}
                        title="Details" icon={<Icon type="solution" />}
                    />

                    <Step
                        status={step < 3 ? "wait" : (step === 3 ? "process" : "finish")}
                        title="Auto-fill" icon={<Icon type="layout" />}
                    />

                    <Step
                        status={step < 4 ? "wait" : (step === 4 ? "process" : "finish")}
                        title="Done"
                        icon={isLoading[4] ? (<Icon type="loading" />) : (<Icon type="smile-o" />)}
                    />
                </Steps>

                <div style={{ display: 'table', width: '100%', marginTop: '10px' }}>
                    <div style={{ float: "right" }}>
                        <ButtonGroup>
                            <Button
                                type="primary" size='large'
                                onClick={this._skipStep.bind(this, false)} disabled={(editMode && step === 2) || step === 1 || stepInLoading}
                            >
                                <Icon type="left" />
                                Previous
                            </Button>

                            {step < 4 &&
                                <Button
                                    type="primary" size='large'
                                    onClick={this._skipStep.bind(this, true)} disabled={step === 6 || stepInLoading}
                                >
                                    <Icon type="right" />
                                    Next
                                </Button>
                            }

                            {step === 4 &&
                                <Button
                                    type="primary" size='large'
                                    onClick={this._finish.bind(this)}
                                    disabled={stepInLoading}
                                >
                                    <Icon type="check" />
                                    {editMode ? 'Update' : 'Finish'}
                                </Button>
                            }
                        </ButtonGroup>
                    </div>
                </div>

                <div className="card marginTop-15 marginBottom-15">
                    {(() => {
                        if (!isLoading["editMode"] && !isLoading.overall) {
                            switch (step) {
                                case 1:
                                    return (
                                        <Step1
                                            isLoading={isLoading}
                                            filePreview={filePreview}
                                            formData={formData}
                                            formTemplates={formTemplates}
                                            _handleFormChange={this._handleFormChange.bind(this)}
                                            _handleFileChange={this._handleFileChange.bind(this)}
                                            _applyTemplate={this._applyTemplate.bind(this)}
                                            authToken={this.props.auth.authToken}
                                            ref={(Step1Ref => this._stepRefs[1] = Step1Ref)}
                                        />
                                    )

                                    break
                                case 2:
                                    return (
                                        <Step2
                                            classrooms={classrooms}
                                            depositMethods={depositMethods}
                                            formData={formData}
                                            fullName={this.props.auth.fullName}
                                            _handleFormChange={this._handleFormChange.bind(this)}
                                            _handleFormChangeBulk={this._handleFormChangeBulk.bind(this)}
                                            ref={(Step1Ref => this._stepRefs[2] = Step1Ref)}
                                        />
                                    )

                                    break

                                case 3:
                                    return (
                                        <Step3
                                            formData={formData}
                                            _handleFormChange={this._handleFormChange.bind(this)}
                                            _handleFieldTypes={this._handleFieldTypes.bind(this)}
                                            editMode={editMode}
                                            fieldTypes={fieldTypes}
                                        />
                                    )

                                    break

                                case 4:
                                    return (
                                        <Step4
                                            formData={formData}
                                            fieldTypes={fieldTypes}
                                            editMode={editMode}
                                        />
                                    )

                                    break
                                default:
                                    null
                            }
                        } else {
                            return (
                                <Spin style={{ display: 'block', margin: 'auto' }} />
                            )
                        }
                    })()}
                </div>
            </div>
        )
    }
}

CreateFormComponent.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(CreateFormComponent)
