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
import { Steps } from 'antd'
const Step = Steps.Step
import { Button, Icon } from 'antd'
const ButtonGroup = Button.Group
import { message } from 'antd'
import { Spin } from 'antd'

// Steps
import Step1 from './FirstRunWizard/Step1'
import Step2 from './FirstRunWizard/Step2'
import Step3 from './FirstRunWizard/Step3'
import Step4 from './FirstRunWizard/Step4'
import Step5 from './FirstRunWizard/Step5'

class FirstRunWizard extends React.Component {
    constructor(props) {
        super(props)

        // Set default form data
        this.state = {
            step: 0,
            isLoading: {
                1: false,
                overall: true
            },
            formData: {}
        }

        this._stepRefs = {}
    }

    componentDidMount() {
        axios.get(API_URLS.school.get, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
          })
            .then(schoolResponse => {
              const { data: schoolData } = schoolResponse

              if (schoolData && schoolData.length > 0) {
                axios.get(API_URLS.classroom.get, {
                    headers: {
                        "Authorization": `Bearer ${this.props.auth.authToken}`
                    }
                  })
                    .then(classroomResponse => {
                        const { data: classroomData } = classroomResponse

                        if (classroomData && classroomData.length > 0) {
                            this.setState({
                                ...this.state,
                                schoolsExist: true,
                                formData: {
                                    ...this.state.formData,
                                    schools: schoolData
                                },
                                classroomExists: true,
                                step: 4,
                                isLoading: {
                                    overall: false
                                }
                            })
                        } else {
                            this.setState({
                                ...this.state,
                                schoolsExist: true,
                                formData: {
                                    ...this.state.formData,
                                    schools: schoolData
                                },
                                step: 2,
                                isLoading: {
                                    overall: false
                                }
                            })
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
              } else {
                this.setState({
                    ...this.state,
                    step: 1,
                    isLoading: {
                        overall: false
                    }
                })
              }
            })
            .catch(error => {
              console.log(error)
            })
    }

    _skipStep(next) {
        if (next && this._stepRefs[this.state.step]) {
            this._stepRefs[this.state.step]
                .handleSubmit()
                .then(_ => {
                    this.setState({
                        ...this.state,
                        step: next ? ++this.state.step : --this.state.step
                    })
                })

            // this._stepRefs[this.state.step].validateFields(function(errors, values) {
            //     if (errors) {
            //         return
            //     }

                // this.setState({
                //     ...this.state,
                //     step: next ? ++this.state.step : --this.state.step
                // })
            // }.bind(this))
        } else {
            this.setState({
                ...this.state,
                step: next ? ++this.state.step : --this.state.step
            })
        }
    }

    _changeLoading = (step, value) => {
        this.setState({
            ...this.state,
            isLoading: {
                ...this.state.isLoading,
                [step]: value
            },
        })
    }

    updateFormData = data => {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                ...data
            }
        })
    }
    
    render() {
        const { isLoading, step, formData, schoolsExist, classroomExists } = this.state
            , { passwordNeeded, invitationID } = this.props
        
        let stepInLoading = false
        Object.keys(isLoading).map(stepKey => {
            if (isLoading[stepKey]) stepInLoading = true
        })

        return (
            <div className="container marginBottom-30 information-cell-wrapper">
                <Steps className="marginTop-30">
                    {!schoolsExist &&
                        <Step
                            status={step === 1 ? "process" : "finish"}
                            title="School" icon={isLoading[1] ? (<Icon type="loading" />) : (<Icon type="calendar" />)}
                        />
                    }

                    {!classroomExists &&
                        <Step
                            status={step < 2 ? "wait" : (step === 2 ? "process" : "finish")}
                            title="Classroom" icon={<Icon type="book" />}
                        />
                    }

                    <Step
                        status={step < 3 ? "wait" : (step === 3 ? "process" : "finish")}
                        title="Payments" icon={<Icon type="credit-card" theme="outlined" />}
                    />

                    <Step
                        status={step < 4 ? "wait" : (step === 4 ? "process" : "finish")}
                        title="Finished" icon={<Icon type="check" />}
                    />
                </Steps>

                <div className='arrowClass'>
                    <div style={{ float: "right" }}>
                        {/* <ButtonGroup> */}
                            {/* <Button
                                type="primary" size='large'
                                onClick={this._skipStep.bind(this, false)}
                                disabled={step !== 3 || stepInLoading}
                            >
                                <Icon type="left" />
                                Previous
                            </Button> */}

                            <Button
                                type="primary" size='large'
                                onClick={this._skipStep.bind(this, true)} disabled={step === 4 || stepInLoading}
                            >
                                <Icon type="right" />
                                Next
                            </Button>
                        {/* </ButtonGroup> */}
                    </div>
                </div>

                <div className="card marginTop-15 marginBottom-15">
                    {(() => {
                        if (!isLoading.overall) {
                            switch (step) {
                                case 1:
                                    return (
                                        <Step1
                                            ref={(Step1Ref => this._stepRefs[1] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.auth.authToken}
                                            _changeLoading={this._changeLoading}
                                            updateFormData={this.updateFormData}
                                        />
                                    )

                                    break
                                case 2:
                                    return (
                                        <Step2
                                            ref={(Step1Ref => this._stepRefs[2] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.auth.authToken}
                                            formData={formData}
                                            updateFormData={this.updateFormData}
                                            _changeLoading={this._changeLoading}
                                        />
                                    )

                                    break
                                case 3:
                                    return (
                                        <Step3
                                            ref={(Step1Ref => this._stepRefs[3] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.auth.authToken}
                                            formData={formData}
                                            updateFormData={this.updateFormData}
                                            stripeAgreement={formData.stripeAgreement}
                                            _changeLoading={this._changeLoading}
                                        />
                                    )

                                    break
                                case 4:
                                    return (
                                        <Step4
                                            ref={(Step1Ref => this._stepRefs[4] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.auth.authToken}
                                            formData={formData}
                                            updateFormData={this.updateFormData}
                                            _changeLoading={this._changeLoading}
                                        />
                                    )

                                    break
                                case 5:
                                    return (
                                        <Step5
                                            ref={(Step1Ref => this._stepRefs[5] = Step1Ref)}
                                            authToken={this.props.auth.authToken}
                                            _changeLoading={this._changeLoading}
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

FirstRunWizard.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(FirstRunWizard)