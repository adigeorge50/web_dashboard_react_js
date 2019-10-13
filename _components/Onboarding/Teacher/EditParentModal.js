import React from 'react';
import { Button, Modal, Form, Input} from 'antd';
const FormItem = Form.Item;

const EditParentModal = ({visible, toggleModal, editableParent, editValue, handleSubmit}) => {
  return (
    <Modal visible={visible} footer={null} 
    onCancel={_ => toggleModal(false)}
    >
      <Form
       onSubmit={handleSubmit}
       >
        <FormItem label='First name'>
          <Input placeholder="John" 
            value={editableParent ? editableParent.parentFirstName : ''} 
            onChange={(e) => editValue(e.target.value, 'parentFirstName')}
            />
        </FormItem>
        <FormItem label='Last name'>
          <Input placeholder="Doe" 
            value={editableParent ? editableParent.parentLastName : ''} 
            onChange={(e) => editValue(e.target.value, 'parentLastName')}
            />
        </FormItem>
        <FormItem label='Email'>
          <Input disabled placeholder="John@gmail.com" 
            value={editableParent ? editableParent.sendToEmail : ''} 
          />
        </FormItem>
      </Form>
      <Button 
      onClick={handleSubmit}
      >Submit</Button>
    </Modal>
  )
};

export default EditParentModal;
