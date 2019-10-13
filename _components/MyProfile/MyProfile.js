import React, {Component, Fragment} from 'react';
import {
  Link
} from 'react-router-dom';

import { Table, Icon, Spin } from 'antd';
const {Column} = Table;
import ContentLayout from '../ContentLayout';
import EditModal from './EditModal';
import { compose } from "redux";
import { connect } from "react-redux";
import axios from "axios";
import API_URLS from '../../_data/api_urls';
import {updateFullName} from '../../__actions/fullName';

class MyProfile extends Component {
  state = {
    editOpen: false,
    isLoaded: false,
  };

  toggleEditUserModal = () => {
    this.setState((prevState) => ({editOpen: !prevState.editOpen}));
  };

  validateAndUpdate = () => {
    console.log(this.state.editableValues);
  }

  changeValue = (value, name) => {
    this.setState({
      editableValues: {
        ...this.state.editableValues,
        [name]: value
      }
    });
  }

  componentDidMount() {
    const {auth} = this.props;
    axios.get(API_URLS.teacherAccount.get, {
      headers: {
        "Authorization": `Bearer ${auth.authToken}`
      }
    })
    .then(({data}) => {
      const fullName = `${data.firstName} ${data.lastName}`;
      this.setState({
        userProfile: [{...data, fullName}],
        editableValues: {...data, fullName},
        isLoaded: true,
      });
    })
    .catch(error => {
      console.log(error)
    });
  }

  handleSubmit = () => {
    const {auth} = this.props;
    const {firstName, lastName, email} = this.state.editableValues;
    const formData = {firstName, lastName, email};
    this.setState({isLoaded: false})
    axios.put(API_URLS.teacherAccount.put, formData, {
      headers: {
        "Authorization": `Bearer ${auth.authToken}`
      }
    })
    .then(() => {
      const fullName = `${firstName} ${lastName}`;
      this.setState({
        userProfile: [{firstName, lastName, email, fullName}],
        editOpen: false,
        isLoaded: true,
      }, () => {this.props.updateFullName(fullName)});
      
    })
    .catch(error => {
      const {userProfile} = this.state;
      this.setState({
        editableValues: userProfile,
        editOpen: true,
      })
    });
  }

  render() {
    const {userProfile, editableValues, editOpen, isLoaded} = this.state;

    return (
    <div className="container marginTop-15">
      <ContentLayout
          sider={
              <Link to="/">
                  <Icon type="left" /> Back to calendar
              </Link>
          }
          style={{ marginBottom: 30 }}
      />

    {!isLoaded ? 
        (<div className="container" style={{ textAlign: "center", paddingTop: 30 }}>
          <Spin />
        </div>
        ) : 
        (
          <Fragment>
            <Table dataSource={userProfile} pagination={false} className='myprofile-usertable'>
              <Column
                  title="Name"
                  key="name"
                  dataIndex="fullName"
                  className="myprofile-usertable-row"
              />
      
              <Column
                  title="Email"
                  key="email"
                  dataIndex="email"
                  className="myprofile-usertable-row"
              />
      
              <Column
                  title="Actions"
                  key="action"
                  className="myprofile-usertable-row"
                  render={(text, record) => (
                      <span>
                          <a href="#" onClick={(e) => {
                              e.preventDefault();
                              this.toggleEditUserModal();
                          }}>
                              <Icon type="edit" /> Edit
                          </a>
                      </span>
                  )}
                />
            </Table>
            <EditModal
              visible={editOpen}
              validateAndUpdate={this.validateAndUpdate}
              closeModal={this.toggleEditUserModal}
              editableValues={editableValues}
              editValue={this.changeValue}
              handleSubmit={this.handleSubmit}
            />
          </Fragment>  
        )
      }

    </div>
    )}
}

export default compose(
  connect(
    state => ({
      auth: state.auth,
      localization: state.localization
    }),
    {updateFullName}
  )
)((MyProfile));
