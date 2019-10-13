import React from 'react';
import { Button, Modal, Form, Input} from 'antd';
const FormItem = Form.Item;

const EditModal = ({visible, editableValues, editValue, validateAndUpdate, closeModal, handleSubmit}) => {
  return (
    <Modal visible={visible} footer={null} onCancel={closeModal}>
      <Form onSubmit={handleSubmit}>
        <FormItem label='First name'>
          <Input placeholder="John" value={editableValues.firstName} onChange={(e) => editValue(e.target.value, 'firstName')}/>
        </FormItem>
        <FormItem label='Last name'>
          <Input placeholder="Doe" value={editableValues.lastName} onChange={(e) => editValue(e.target.value, 'lastName')}/>
        </FormItem>
        <FormItem label='Email'>
          <Input disabled placeholder="John" value={editableValues.email} />
        </FormItem>
        {/* <FormItem label='Old password'>
          <Input type="password" />
        </FormItem>
        <FormItem label='New password'>
          <Input type="password" />
        </FormItem>
        <FormItem label='Repeat new password'>
          <Input type="password" />
        </FormItem> */}
      </Form>
      <Button onClick={handleSubmit}>Submit</Button>
    </Modal>
  )
};

export default EditModal;
