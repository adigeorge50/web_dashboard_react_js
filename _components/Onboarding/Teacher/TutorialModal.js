import React, { Component } from "react";
import { Button, Modal } from "antd";

import MainLogo from "../../../img/Tutorial/at-school.svg";
import Notification from "../../../img/Tutorial/notification.svg";
import Homework from "../../../img/Tutorial/homework.svg";
import Permission from "../../../img/Tutorial/permission.svg";
import Bank from "../../../img/Tutorial/bank.svg";
import Event from "../../../img/Tutorial/event.svg";
import News from "../../../img/Tutorial/newsletter.svg";


export default class TutorialModal extends Component {
  state = {
    modalIsOpen: true,
    step: 1
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  nextStep = () => {
    if (this.state.step >= 7) {
      this.closeModal();
    } else {
      this.setState(prevState => ({ step: prevState.step + 1 }));
    }
  };

  renderTemplate = (picture, mainText, descriptionText, altText, optionText ?, optionURL ? ) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "16px"
        }}
      >
        <img src={picture} alt={altText} style={{ height: "175px", paddingBottom: "16px", paddingTop: "16px" }} />
      </div>
      <h2 style={{ fontSize: "24px", color: "#2b1f63", textAlign: "center" }}>
        {mainText}
      </h2>
      <p style={{ fontSize: "15px", textAlign: "left",  paddingBottom: "16px", paddingLeft: "5px" }}>{descriptionText}</p>
      <p style={{ fontSize: "15px", textAlign: "left",  paddingBottom: "16px", paddingLeft: "5px" }}>{optionText}</p>
      <p style={{ fontSize: "15px", textAlign: "left",  paddingBottom: "16px", paddingLeft: "5px" }}>{optionURL}</p>
    </div>
  );

  renderStep = step => {
    switch (step) {
      case 1:
        return this.renderTemplate(
          MainLogo,
          "Touch. Sign. Pay.",
          `Use the calendar dashbaord to enter engagements in the At School Today app for parents to be automatically informed.`,
          "At School Today Logo",
          `(It is a real time saver. Save some for yourself.)`
        );
      case 2:
        return this.renderTemplate(
          Notification,
          "Notification & Reminders",
          `Create touchable notifications that link directly to any engagement type such as homework, auto-fill permission forms, payments, PDF newsletters, field trips or simply send a reminder.`,
          "Notifications image",
          `Each engagement type will allow you to enter a message and schedule when to send it.`
        );
      case 3:
        return this.renderTemplate(
          Homework,
          "Link to Homework Anywhere",
          `Let parents know when homework is due. Make a homework engagement with a notification reminder that links to wherever you provide homework online: Google Classroom or any other online tool. Resources can exist anywhere.`,
          "Homework image"
        );
      case 4:
        return this.renderTemplate(
          Permission,
          "Auto-fill Permission Forms",
          `Create auto-fill permission forms for parents so they don’t need to fill out the same information repeatedly. They will love you for it! They can make a payment at the same time and sign with their finger.`,
          "Permission Forms image",
          `Simply drag and drop auto-fill areas onto PDF froms that you already use. Save it as a template so you can use it or modify it again and again! As parents enter info over time, their smartphone saves it automatically to use again. (Yeah sweet.)`
        );
      case 5:
        return this.renderTemplate(
          Bank,
          "Payments, Fundraising and Donations",
          `Include payments with permission forms, fundraise with a form, collect donations or sell school apparel! Transactions are secured by Stripe. We open an account for you AUTOMATICALLY to use right away. You can choose to deposit to your school’s bank account or collect to your own to transfer or e-mail funds later. You can go old school and drop a cheque at the office. (Yeah, we made it as easy as 1, 2, 3).`,
          "Money image",
          "https://stripe.com/ca/payments"
        );
      case 6:
        return this.renderTemplate(
          Event,
          "Events with Automatic Directions",
          `Having a party or special event? Going to a sports game or on a field trip? We provide directions automatically. When you type in your event location such as, "CN Tower", we look it up for you and include it in your engagment. (Easy as pie... No! a piece of cake... no... pie...)`,
          "Money image"
        );
        case 7:
        return this.renderTemplate(
          News,
          "Circulate Newsletters",
          `If you provide a weekly or mothly newsletter, upload them as a PDF and schedule them to send in advace. Include a touch notification with it so it can be opened directly from the message on parents' smartphones.`,
          "Money image"
        );
        
      default:
        return null;
    }
  };

  render() {
    const { modalIsOpen, step } = this.state;
    return (
      <Modal
        visible={modalIsOpen}
        width="410px"
        footer={null}
        closable={false}
        centered
      >
        <div
          style={{
            height: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {this.renderStep(step)}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Button onClick={this.closeModal}>CLOSE</Button>
            <p>{`${step}/7`}</p>
            <Button type="primary" onClick={this.nextStep}>
              {step !== 7 ? "NEXT" : "FINISH"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
