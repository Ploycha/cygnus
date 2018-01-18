import React, {Component} from 'react'
import {Tabs, Tab} from 'material-ui/Tabs'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Input from '../frontend/input/Input'
import RaisedButton from 'material-ui/RaisedButton'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Dialog from 'material-ui/Dialog'
import Toggle from 'material-ui/Toggle';
import MD5 from '../lib/md5'
import './Account.css'
import {
  showAlert,
  hideAlert,
  setAccountTab,
} from '../actions/index'

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  tab: {
    backgroundColor: '#2e5077',
    borderRadius: '3px',
    color: 'rgba(244,176,4,0.9)',
  },
  inkBar: {
    backgroundColor: 'rgba(244,176,4,0.8)',
  },
  container: {
    backgroundColor: '#2e5077',
    borderRadius: '3px',
  },
  radioButton: {
    label: {
      color: 'rgba(244,176,4,0.9)',
    },
    icon: {
      fill: 'rgba(244,176,4,1)',
    },
  },
  toggleSwitch: {
    thumbOff: {
      backgroundColor: '#2e5077',
    },
    trackOff: {
      backgroundColor: '#2e5077',
    },
    thumbSwitched: {
      backgroundColor: 'rgb(244,176,4)',
    },
    trackSwitched: {
      backgroundColor: 'rgb(244,176,4)',
    },
    labelStyle: {
      color: 'rgb(244,176,4)',
    },
  },
}

const emailValidatorRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstNameDisplay: '',
      lastNameDisplay: '',
      emailDisplay: '',
      paymentAddressDisplay: '',
      gravatarPath: '/img/gravatar.jpg',
    }
  }

  handleAccountDiscoverableToggle = (event, isInputChecked) => {
    if (isInputChecked === true) {
      console.log('Account is discoverable')
    }
  }

  handleFirstNameChange = (event) => {
    this.setState({
      firstNameDisplay: event.target.value
    })
  }

  handleLastNameChange = (event) => {
    this.setState({
      lastNameDisplay: event.target.value
    })
  }

  handleEmailChange = (event) => {
    if (emailValidatorRegex.test(event.target.value) === true) {
      this.setState({
        gravatarPath: (
          'https://www.gravatar.com/avatar/' + MD5(event.target.value) +
          '?s=96'
        )
      })
    }
    this.setState({
      emailDisplay: event.target.value
    })
  }

  handlePaymentAddressChange = (event) => {
    this.setState({
      paymentAddressDisplay: event.target.value
    })
  }

  handleProfileUpdate = (event) => {
    console.log('Update Pressed')
  }

  handleChange = (value) => {
    this.props.setAccountTab(value)
  }

  handleOpen = () => {
    this.props.showAlert()
  }

  handleClose = () => {
    this.props.hideAlert()
  }

  render() {
    const actions = [
      <RaisedButton
        backgroundColor="rgb(15,46,83)"
        labelColor="rgb(244,176,4)"
        label="OK"
        keyboardFocused={true}
        onClick={this.handleClose}
      />,
    ]
    return (
      <div>
        <MuiThemeProvider>
          <div>
            <Dialog
              title="Not Yet Implemented"
              actions={actions}
              modal={false}
              open={this.props.modal.isShowing}
              onRequestClose={this.handleClose}
              paperClassName="modal-body"
              titleClassName="modal-title"
            >
              Pardon the mess. We are working hard to bring you this feature very
              soon. Please check back in a while as the feature implementation
              is being continuously deployed.
            </Dialog>
          </div>
        </MuiThemeProvider>
        <MuiThemeProvider>
          <Tabs
            tabItemContainerStyle={styles.container}
            inkBarStyle={styles.inkBar}
            value={this.props.tabBar.tabSelected}
            onChange={this.handleChange}
            className="tabs-container"
          >
            <Tab style={styles.tab} label="Profile" value="1">
              <div className="tab-content">
                <div className="flex-row">
                  <div>
                    <h2 style={styles.headline}>Account Profile</h2>
                    <div className="account-title">
                      Fill out your profile details.
                    </div>
                    <div className="account-subtitle">
                      Only your payment address is visible to public.
                      The details of your account profile contribute to KYC/AML
                      compliance.
                    </div>
                  </div>
                  <div className="gravatar">
                    <figure>
                      <img className="image"
                        src={this.state.gravatarPath}
                        alt="Gravatar"
                      />
                    </figure>
                  </div>
                </div>
                <div className="flex-centered">
                  <div className="p-b">
                    <Input
                      label="First Name"
                      inputType="text"
                      maxLength="100"
                      autoComplete="off"
                      handleChange={this.handleFirstNameChange.bind(this)}
                      subLabel={
                        "First Name: " + this.state.firstNameDisplay
                      }/>
                  </div>
                  <div className="p-t p-b">
                    <Input
                      label="Last Name"
                      inputType="text"
                      maxLength="100"
                      autoComplete="off"
                      handleChange={this.handleLastNameChange.bind(this)}
                      subLabel={
                        "Last Name: " + this.state.lastNameDisplay
                      }/>
                  </div>
                  <div className="p-t p-b">
                    <Input
                      label="Email"
                      inputType="text"
                      maxLength="100"
                      autoComplete="off"
                      handleChange={this.handleEmailChange.bind(this)}
                      subLabel={
                        "Email: " + this.state.emailDisplay
                      }/>
                  </div>
                  <div className="p-t p-b">
                    <Input
                      label="Payment Address Alias"
                      inputType="text"
                      maxLength="100"
                      autoComplete="off"
                      handleChange={this.handlePaymentAddressChange.bind(this)}
                      subLabel={
                        "Payment Address: " +
                        this.state.paymentAddressDisplay +
                        (this.state.paymentAddressDisplay === '' ?
                          "" : "*stellarfox.net")
                      }/>
                  </div>
                </div>
                <div className="p-t">
                  <RaisedButton
                    backgroundColor="rgb(244,176,4)"
                    labelColor="rgb(15,46,83)"
                    label="Update"
                    onClick={this.handleOpen.bind(this)}
                  />
                </div>
              </div>
            </Tab>
            <Tab style={styles.tab} label="Settings" value="2">
              <div>
                <h2 style={styles.headline}>Account Settings</h2>
                <div className="account-title">
                  Adjust settings for your account.
                </div>
                <div className="account-subtitle">
                  General account related settings. This configuration specifies
                  how the account related views are displayed to the user.
                </div>

                <div className="p-t p-b"></div>
                <div className="account-title p-t">
                  Display Currency:
                </div>
                <div className="account-subtitle">
                  Choose the currency you want to use in your account.
                </div>
                <MuiThemeProvider>
                  <RadioButtonGroup className="account-radio-group" name="shipSpeed" defaultSelected="eur">
                    <RadioButton
                      className="p-b-small"
                      value="eur"
                      label="EUR"
                      labelStyle={styles.radioButton.label}
                      iconStyle={styles.radioButton.icon}
                    />
                    <RadioButton
                      value="usd"
                      label="USD"
                      labelStyle={styles.radioButton.label}
                      iconStyle={styles.radioButton.icon}
                    />
                  </RadioButtonGroup>
                </MuiThemeProvider>

                <div className="p-t p-b"></div>
                <div className="flex-row outline">
                  <div>
                    <div className="account-title">
                      Make Account Discoverable
                    </div>
                    <div className="account-subtitle">
                      Your account will be publicly discoverable and can be found
                      by your payment address.
                    </div>
                  </div>
                  <div>
                    <MuiThemeProvider>
                      <Toggle
                        onToggle={this.handleAccountDiscoverableToggle.bind(this)}
                        labelPosition="right"
                        thumbStyle={styles.toggleSwitch.thumbOff}
                        trackStyle={styles.toggleSwitch.trackOff}
                        thumbSwitchedStyle={styles.toggleSwitch.thumbSwitched}
                        trackSwitchedStyle={styles.toggleSwitch.trackSwitched}
                        labelStyle={styles.toggleSwitch.labelStyle}
                      />
                    </MuiThemeProvider>
                  </div>
                </div>
              </div>
            </Tab>
            <Tab style={styles.tab} label="Security" value="3">
              <div>
                <h2 style={styles.headline}>Account Security</h2>
                <p>
                  Set your security here.
                </p>
              </div>
            </Tab>
          </Tabs>
        </MuiThemeProvider>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    modal: state.modal,
    tabBar: state.tabBar,
  }
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    showAlert,
    hideAlert,
    setAccountTab,
  }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(Account)
