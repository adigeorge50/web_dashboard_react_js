// React-related
import React, {Fragment} from 'react'
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
import Step1 from './ChoosePasswordWizard/Step1'
import Step2 from './ChoosePasswordWizard/Step2'
import Step3 from './ChoosePasswordWizard/Step3'
import Step4 from './ChoosePasswordWizard/Step4'
import Step5 from './ChoosePasswordWizard/Step5'

class ChoosePasswordWizard extends React.Component {
    constructor(props) {
        super(props)

        // Set default form data
        this.state = {
            step: props.passwordNeeded ? 1 : 2,
            isLoading: {
                1: false,
                overall: false
            },
            formData: {}
        }

        this._stepRefs = {}
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
        const { isLoading, step, formData } = this.state
            , { passwordNeeded, invitationID, newParentId } = this.props
        let stepInLoading = false
        Object.keys(isLoading).map(stepKey => {
            if (isLoading[stepKey]) stepInLoading = true
        });
        return (
            <div className="container marginBottom-30">
                    {passwordNeeded ? (
                      <Steps className="marginTop-30">
                        <Step
                          status={step === 1 ? "process" : "finish"}
                          title="Password" icon={isLoading[1] ? (<Icon type="loading" />) : (<Icon type="lock" />)}
                        />
                      </Steps>
                      ) : (
                      <Steps className="marginTop-30">
                          <Step
                              status={step < 2 ? "wait" : (step === 2 ? "process" : "finish")}
                              title="Parent Name" icon={<Icon type="solution" />}
                          />

                          <Step
                              status={step < 3 ? "wait" : (step === 3 ? "process" : "finish")}
                              title="Student Name" icon={<Icon type="layout" />}
                          />

                          <Step
                              status={step < 4 ? "wait" : (step === 4 ? "process" : "finish")}
                              title="Accept" icon={<Icon type="check" />}
                          />

                          <Step
                              status={step < 5 ? "wait" : (step === 5 ? "process" : "finish")}
                              title="Tell others" icon={<Icon type="notification" />}
                          />
                        </Steps>
                      )}

                <div style={{ display: 'table', width: '100%', marginTop: '10px' }}>
                    <div style={{ float: "right" }}>
                        {step === 1 ? (
                        <ButtonGroup>
                         <Button
                            type="primary" size='large'
                            onClick={this._skipStep.bind(this, true)} disabled={step === 6 || stepInLoading}
                          >
                            Save password
                          </Button>
                        </ButtonGroup>
                        ) : (
                        <ButtonGroup>
                            <Button
                                type="primary" size='large'
                                onClick={step === 2 ? () => this.props.history.push('/') : this._skipStep.bind(this, false)}
                                disabled={(step !== 3 && step !== 2) || stepInLoading}
                            >
                                <Icon type="left" />
                                Previous
                            </Button>

                            {step < 5 &&
                                <Button
                                    type="primary" size='large'
                                    onClick={this._skipStep.bind(this, true)} disabled={step === 6 || stepInLoading}
                                >
                                    <Icon type="right" />
                                    {step === 3 ? "Accept" : "Next"}
                                </Button>
                            }

                            {step === 5 &&
                                <Link to="/">
                                    <Button
                                        type="primary" size='large'
                                        disabled={stepInLoading}
                                    >
                                        <Icon type="check" />
                                        Finish
                                    </Button>
                                </Link>
                            }
                        </ButtonGroup>)}


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
                                            authToken={this.props.authToken}
                                            _changeLoading={this._changeLoading}
                                            newParentId={newParentId}
                                        />
                                    )

                                    break
                                case 2:
                                    return (
                                        <Step2
                                            ref={(Step1Ref => this._stepRefs[2] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.authToken}
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
                                            authToken={this.props.authToken}
                                            formData={formData}
                                            updateFormData={this.updateFormData}
                                            studentName={formData.studentName}
                                            _changeLoading={this._changeLoading}
                                        />
                                    )

                                    break
                                case 4:
                                    return (
                                        <Step4
                                            ref={(Step1Ref => this._stepRefs[4] = Step1Ref)}
                                            invitationID={invitationID}
                                            authToken={this.props.authToken}
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
                                            authToken={this.props.authToken}
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

ChoosePasswordWizard.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(ChoosePasswordWizard)
