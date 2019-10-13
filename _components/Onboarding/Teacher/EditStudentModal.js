import React from 'react';
import { Button, Modal, Form, Input} from 'antd';
const FormItem = Form.Item;

const EditStudentModal = ({visible, toggleModal, editableStudent, editValue, handleSubmit}) => {
  return (
    <Modal visible={visible} footer={null} onCancel={_ => toggleModal(false)}>
      <Form
       onSubmit={handleSubmit}
       >
        <FormItem label='First name'>
          <Input placeholder="John" 
            value={editableStudent ? editableStudent.studentFirstName : ''} 
            onChange={(e) => editValue(e.target.value, 'studentFirstName')}
            />
        </FormItem>
        <FormItem label='Last name'>
          <Input placeholder="Doe" 
            value={editableStudent ? editableStudent.studentLastName : ''} 
            onChange={(e) => editValue(e.target.value, 'studentLastName')}
            />
        </FormItem>
        {/* <FormItem label='Email'>
          <Input disabled placeholder="John" 
            // value={editableStudent.email} 
          />
        </FormItem> */}
      </Form>
      <Button 
      onClick={handleSubmit}
      >Submit</Button>
    </Modal>
  )
};

export default EditStudentModal;
