import React from "react";

// Antd
import { Icon } from "antd";
import { Spin } from "antd";
import { Form, Input, message, Button } from "antd";
const FormItem = Form.Item;
import { Row, Col } from "antd";
import { Select } from 'antd';
const Option = Select.Option;

// Networking
import axios from "axios";
import API_URLS from "../../../../_data/api_urls";

// Messages
import MESSAGES from "../../../../_data/messages";

let uuid = 0;
class DynamicFieldSet extends React.Component {
  componentDidMount() {
    this.add();
  }

  remove = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    const nextKeys = keys.concat(uuid);
    uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator("keys", { initialValue: [] });
    const keys = getFieldValue("keys");
    const formItems = keys.map((k, index) => {
      return (
        <div key={k}>
		  <h4>
			  Invitee #{index + 1}
		  </h4>

		  {keys.length > 1 ? (
			<Icon
				className="dynamic-delete-button"
				type="minus-circle-o"
				disabled={keys.length === 1}
				onClick={() => this.remove(k)}
				style={{ float: "right", marginTop: -30 }}
			/>
		  ) : null}
			
          <Row gutter={32}>
            <Col xs={24} md={12} lg={6}>
              <FormItem
                label="First Name"
                required={false}
              >
                {getFieldDecorator(`firstNames[${k}]`, {
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      message: "Please input a first name"
                    }
                  ]
                })(<Input placeholder="John" />)}
              </FormItem>
            </Col>

			<Col xs={24} md={12} lg={6}>
              <FormItem
                label="Last Name"
                required={false}
              >
                {getFieldDecorator(`lastNames[${k}]`, {
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      message: "Please input a last name"
                    }
                  ]
                })(<Input placeholder="Smith" />)}
              </FormItem>
            </Col>

			<Col xs={24} md={12} lg={6}>
              <FormItem
                label="Email"
                required={false}
              >
                {getFieldDecorator(`emails[${k}]`, {
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      message: "Please input an  email"
					},
					{
					  type: "email",
					  message: "Email format is incorrect"
					}
                  ]
                })(<Input placeholder="john@smith.domain" />)}
              </FormItem>
            </Col>

			<Col xs={24} md={12} lg={6}>
              <FormItem
                label="Relationship"
                required={false}
              >
                {getFieldDecorator(`relationships[${k}]`, {
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message:
                        "Please provide relationship"
                    }
                  ]
                })(
					<Select
						showSearch
						style={{ width: 200 }}
						placeholder="Select an option"
						optionFilterProp="children"
						// onChange={handleChange}
						// onFocus={handleFocus}
						// onBlur={handleBlur}
						// filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
					>
						<Option value="parent">Parent</Option>
						<Option value="teacher">Teacher</Option>
						<Option value="class-parent">Class Parent</Option>
						<Option value="principal">Principal</Option>
					</Select>
				)}
              </FormItem>
            </Col>
          </Row>
        </div>
      );
	});
	
    return (
      <Form onSubmit={this.props.handleSubmit}>
        {formItems}
        <FormItem>
          <Button type="dashed" onClick={this.add} style={{ width: "60%" }}>
            <Icon type="plus" /> Add invitee
          </Button>
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" size="large">
            Share
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedDynamicFieldSet = Form.create()(DynamicFieldSet);

export default class Comp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      loadingMessage: "Sending invites"
    };
  }

  handleSubmit = e => {
	e.preventDefault();
	
    this.formComponent.validateFields((err, values) => {
      if (!err) {
		console.log("Received values of form: ", values);
		
		const body = {
			individuals: values.firstNames.map((firstName, i) => (
												{
													"firstName": firstName,
													"lastName": values.lastNames[i],
													"email": values.emails[i],
													"role": values.relationships[i]
												}
											))
    }
    
		this.setState({
			...this.state,
			isLoading: true
		})

		axios.post(API_URLS.refer, body, {
			headers: {
				"Authorization": `Bearer ${this.props.authToken}`
			}
		})
		.then(response => {
			this.setState({
				...this.state,
				isLoading: false
			})

			const { data } = response
			console.log(data)

			message.success(MESSAGES.success.invite)
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
    });
  };

  render() {
    const { loadingMessage, isLoading } = this.state;

    return (
      <Spin tip={loadingMessage} spinning={isLoading}>
        <WrappedDynamicFieldSet handleSubmit={this.handleSubmit} ref={formComponent => this.formComponent = formComponent} />
      </Spin>
    );
  }
}
