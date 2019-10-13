import React from 'react'

// Antd
import { Select, Checkbox } from 'antd'
import { Spin } from 'antd'
import { Form, Input, message } from 'antd'
const FormItem = Form.Item

// Networking
import axios from 'axios'
import API_URLS from '../../../../_data/api_urls'

// Messages
import MESSAGES from '../../../../_data/messages'

import { parseQueryString } from "../../../../_utils/index"

// Misc
import POWERED_BY_STRIPE from "../../../../img/powered_by_stripe.svg"

class NormalLoginForm extends React.Component {
    updateFormData = (e, name) => {
        const value = e.target ? e.target.value : e

        this.props.updateFormData({
            [name]: value
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form
        const { stripeAgreement } = this.props

        return (
            <div className="form-centered">
                <Form className="login-form" style={{ margin: "auto", marginTop: "20px", width: "90%", maxWidth: 500 }}>
                    <FormItem
                        label="Country"
                        className="marginTop-15"
                    >
                        {getFieldDecorator('country', {
                            rules: [
                                { required: true, message: 'Please select your country' }
                            ]
                        })(
                            <Select
                                style={{ width: '80%', maxWidth: '200px' }}
                                onChange={value => this.updateFormData(value, "country")}
                            >
                                {[
                                    {name: "Canada", value: "ca"},
                                    {name: "United States", value: "us"}
                                 ].map((country, i) => (
                                    <Option key={`country-${i}`} value={country.value}>
                                        {country.name}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem
                        label="Account Type"
                        className="marginTop-15"
                    >
                        {getFieldDecorator('entityType', {
                            rules: [
                                { required: true, message: 'Please specify account type' }
                            ]
                        })(
                            <Select
                                style={{ width: '80%', maxWidth: '200px' }}
                                onChange={value => this.updateFormData(value, "entityType")}
                            >
                                {[
                                    {name: "Individual", value: "individual"},
                                    {name: "School", value: "school"}
                                 ].map((entityType, i) => (
                                    <Option key={`entityType-${i}`} value={entityType.value}>
                                        {entityType.name}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    
                    <FormItem
                        className="marginTop-15"
                    >
                        {getFieldDecorator('stripeAgreement', {
                            rules: [
                                { required: true, message: "Please agree to Stripe's terms of service" }
                            ]
                        })(
                            <Checkbox
                                checked={stripeAgreement}
                                onChange={e => this.updateFormData(e.target.checked, "stripeAgreement")}
                            >
                                I agree to the <a href="https://stripe.com/ca/connect-account/legal" target="_blank">Stripe Connected Account Agreement</a>
                            </Checkbox>
                        )}
                    </FormItem>

                    <div style={{ textAlign: "left", marginBottom: 15 }}>
                        <a href="https://stripe.com" target="_blank">
                            <img src={POWERED_BY_STRIPE} style={{ width: 120 }} />
                        </a>
                    </div>
                </Form>
            </div>
        )
    }
}

const FormComponent = Form.create()(NormalLoginForm)

export default class Comp extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            loadingMessage: "Submitting Records"
        }
    }

    componentDidMount() {
        const { formData } = this.props
        this.formComponent.setFieldsValue({
            "country": formData.country,
            "entityType": formData.entityType,
            "stripeAgreement": formData.stripeAgreement
        })
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()

        return new Promise((resolve, reject) => {
            this.formComponent.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    this.setState({
                        ...this.state,
                        isLoading: true
                    })
            
                    const dataToSubmit = {
                        "country": values.country,
                        "entityType": values.entityType,
                        "stripeAgreement": values.stripeAgreement
                    }
                    axios.post(API_URLS.paymentAccount.post, dataToSubmit, {
                        headers: {
                            "Authorization": `Bearer ${this.props.authToken}`
                        }
                    })
                    .then(response => {
                        this.setState({
                            ...this.state,
                            isLoading: false
                        })
            
                        message.success(MESSAGES.success.saved)

                        this.props.updateFormData(dataToSubmit)

                        return resolve(true)
                    })
                    .catch(error => {
                        console.log(error)
            
                        this.setState({
                            ...this.state,
                            isLoading: false
                        })
            
                        message.error(MESSAGES.error.default)
                    })
                }
            })
        })
    }

    render() {
        const { loadingMessage, isLoading } = this.state
        const { updateFormData, stripeAgreement } = this.props

        return (
            <Spin tip={loadingMessage} spinning={isLoading}>
                <FormComponent
                    ref={formComponent => this.formComponent = formComponent}
                    stripeAgreement={stripeAgreement}
                    updateFormData={updateFormData}
                />
            </Spin>
        )
    }
}