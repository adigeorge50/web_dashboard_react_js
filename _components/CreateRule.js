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

// Redux
import { ToastContainer, toast } from 'react-toastify'

import axios from 'axios'
import { withCookies, Cookies } from 'react-cookie'

// Material UI
import { withStyles } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Grid from 'material-ui/Grid'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import Avatar from 'material-ui/Avatar'
import {
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    FormHelperText,
} from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import AddIcon from 'material-ui-icons/Add'
import CheckIcon from 'material-ui-icons/Check'
import MaskedInput from 'react-text-mask'
import Input from 'material-ui/Input'
// Card
import Card, { CardActions, CardContent } from 'material-ui/Card'
import Menu, { MenuItem } from 'material-ui/Menu'

const API_DATA = require('../../data/api-data')

const styles = theme => ({
    root: {
        width: '100%'
    },
    flex: {
        flex: 1,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '95%',
    },
    input: {
        margin: theme.spacing.unit,
    }
});

class TextMaskCustom extends React.Component {
  render() {
    return (
      <MaskedInput
        {...this.props}
        mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/]}
        placeholder="hh/dd/mm"
        placeholderChar={'\u2000'}
        guide={false}
        showMask
      />
    );
  }
}

class CreateRuleComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            anchorEl: null,
            // Add or remove to the template
            templateItems: {
                'CandidateName': 'Candidate Name',
                'InterviewStatus': 'Interview Status',
                'InterviewType': 'Interview Type',
                'AppointmentDate': 'Appointment Date',
                'ArrangedDate': 'Arranged Date',
                'CompanyName': 'Company Name'
            },
            checkedInterviewTypes: {},
            remindersStack: [true],
            reminders: [],
            defaultReminder: true,
            active: true,
            editMode: false,
            addIntType: false
        };
    }

    componentDidMount() {
        const { location } = this.props;
        if (location.pathname.indexOf('edit') > -1) {
            const ruleID = location.pathname.replace('/edit/', '');
            this.setState({
                ...this.state,
                editMode: true,
                loading: true,
                ruleID
            });

            axios.get(API_DATA.RULES.GET_SPECIFIC.local, {
                params: {
                    ruleID
                }
            })
            .then(function (response) {
                console.log(response.data);
                const ruleObj = response.data.value;
                const checkedInterviewTypes = {};
                for (let checkedInterviewType of ruleObj.interviewTypes) {
                    checkedInterviewTypes[checkedInterviewType] = true;
                }

                this.textField.value = ruleObj.message;
                this.setState({
                    ...this.state,
                    loading: false,
                    defaultReminder: ruleObj.defaultReminder,
                    active: ruleObj.active,
                    reminders: ruleObj.reminders,
                    checkedInterviewTypes
                })
            }.bind(this))
            .catch(function (error) {
                console.log(error);

                this._toggleLoading(false);

                toast.error("Something went wrong!", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }.bind(this));
        }

        axios.get(API_DATA.INTERVIEW_TYPES.GET_ALL.local)
          .then(function (response) {
            this.setState({
                ...this.state,
                loading: false,
                interviewTypes: response.data.types
            })
          }.bind(this))
          .catch(function (error) {
            console.log(error);

            this._toggleLoading(false);

            toast.error("Something went wrong!", {
                position: toast.POSITION.TOP_RIGHT
            });
          }.bind(this));
    }

    handleChange(name, event, checked) {
        this.setState({
            ...this.state,
            checkedInterviewTypes: {
                ...this.state.checkedInterviewTypes,
                [name]: checked
            }
        }, () => console.log(this.state));
    };

    _handleReminderChange(e, index) {
        let remindersArray = this.state.reminders;
        remindersArray[index] = e.target.value;

        this.setState({
            ...this.state,
            reminders: remindersArray
        });
    };

    handleClick (event) {
        event.preventDefault();
        this.textField.focus();

        this.setState({
            ...this.state,
            anchorEl: event.currentTarget
        });
    };

    handleClose () {
        this.setState({
            ...this.state,
            anchorEl: null
        });
    };

    _handleTemplateSnippet(key) {
        const selectionStart = this.textField.selectionStart
            , selectionEnd = this.textField.selectionEnd
            , currentValue = this.textField.value;
        if (selectionStart === selectionEnd) {
            this.textField.value = [currentValue.slice(0, selectionStart), `{{${key}}}`, currentValue.slice(selectionStart)].join('');
        } else {
            this.textField.value = [currentValue.slice(0, selectionStart), `{{${key}}}`, currentValue.slice(selectionEnd)].join('');
        }

        this.setState({
            ...this.state,
            anchorEl: null
        });
    }

    _addReminder() {
        const rStack = this.state.remindersStack;
        rStack.push(true);

        this.setState({
            ...this.state,
            rStack
        });
    }

    _toggleLoading(loading) {
        this.setState({
            ...this.state,
            loading
        })
    }

    _onSubmit(e) {
        e.preventDefault();

        const { checkedInterviewTypes, editMode, ruleID } = this.state
            , interviewTypes = Object.keys(checkedInterviewTypes).filter(interviewTypeKey => checkedInterviewTypes[interviewTypeKey] === true)
            , url = editMode ? API_DATA.RULES.UPDATE.local : API_DATA.RULES.CREATE_SEARCH.local;
        this._toggleLoading(true);
        axios.post(url, {
            message: this.textField.value,
            reminders: this.state.reminders,
            defaultReminder: this.state.defaultReminder,
            active: this.state.active,
            interviewTypes,
            ruleID: ruleID ? ruleID : undefined
          })
          .then(function (response) {
            console.log(response.data);

            this._toggleLoading(false);

            toast.success("Done!", {
                position: toast.POSITION.TOP_RIGHT
            });

            this.props.history.push('/');
          }.bind(this))
          .catch(function (error) {
            console.log(error);

            this._toggleLoading(false);

            toast.error("Something went wrong!", {
                position: toast.POSITION.TOP_RIGHT
            });
          }.bind(this));
    }
    
    _toggleAddIntType(e) {
        e.preventDefault()

        this.setState({
            ...this.state,
            addIntType: !this.state.addIntType
        })
    }

    _addIntType(e) {
        e.preventDefault()

        const { addIntTypeValue } = this.state
        if (addIntTypeValue && addIntTypeValue.length > 0) {
            console.log(addIntTypeValue)

            this._toggleLoading(true)

            axios.post(API_DATA.INTERVIEW_TYPES.ADD.local, {
                name: addIntTypeValue
              })
              .then(function (response) {
                console.log(response.data);
    
                this.setState({
                    ...this.state,
                    loading: false,
                    addIntType: false,
                    addIntTypeValue: ''
                }, () => {
                    axios.get(API_DATA.INTERVIEW_TYPES.GET_ALL.local)
                        .then(function (response) {
                            this.setState({
                                ...this.state,
                                loading: false,
                                interviewTypes: response.data.types
                            })
                        }.bind(this))
                        .catch(function (error) {
                            console.log(error);

                            this._toggleLoading(false);

                            toast.error("Something went wrong!", {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }.bind(this))
                })
    
                toast.success("Done!", {
                    position: toast.POSITION.TOP_RIGHT
                });
              }.bind(this))
              .catch(function (error) {
                console.log(error);
    
                this._toggleLoading(false);
    
                toast.error("Something went wrong!", {
                    position: toast.POSITION.TOP_RIGHT
                });
              }.bind(this));
        }
    }

    render() {
        const { classes } = this.props
            , { interviewTypes, templateItems, remindersStack, anchorEl, editMode } = this.state;
        return (
            <div className={"container marginTop-30" + (this.state.loading ? " is-loading" : "")} style={{minHeight: '500px'}}>
                <Typography type="title" gutterBottom>
                    {editMode ? 'Edit a Rule' : 'Create a PCR SMS Rule'}
                </Typography>

                <Paper className='marginTop-30' style={{ marginTop: '15px' }}>
                    <form onSubmit={this._onSubmit.bind(this)}>
                        <div style={{ padding: '15px' }}>
                            <Grid container spacing={24}>
                                <Grid item md={3}>
                                    <FormControl component="fieldset" style={{margin: '5px 0 0 0', minWidth: '95%'}}>
                                        <FormLabel component="legend">
                                            Interview Type <a href="#" onClick={this._toggleAddIntType.bind(this)}>(+)</a>
                                        </FormLabel>

                                        <div style={{ maxHeight: '385px', overflowY: 'scroll', marginTop: '10px' }}>
                                            {this.state.addIntType &&
                                                <div>
                                                    <Input
                                                        placeholder="Name"
                                                        onChange={(e) => { this.setState({ ...this.state, addIntTypeValue: e.target.value }) }}
                                                    />

                                                    <Button
                                                        fab mini color="primary" aria-label="add"
                                                        className={'menu-trigger'}
                                                        style={{ width: '25px', minHeight: 0, height: '25px', marginLeft: '10px', marginBottom: '-6px' }}
                                                        onClick={this._addIntType.bind(this)}
                                                    >
                                                        <CheckIcon style={{ width: '15px', height: '15px' }} />
                                                    </Button>
                                                </div>
                                            }

                                            <FormGroup>
                                                {interviewTypes && interviewTypes.map((interviewType, index) =>
                                                    <FormControlLabel
                                                        key={`interview-type-select-${index}`}
                                                        control={
                                                            <Checkbox
                                                                checked={this.state.checkedInterviewTypes[interviewType.id]}
                                                                onChange={this.handleChange.bind(this, interviewType.id)}
                                                            />
                                                        }
                                                        label={interviewType.value}
                                                    />
                                                )}
                                            </FormGroup>
                                        </div>
                                    </FormControl>
                                </Grid>

                                <Grid item md={9} className="create-textField">
                                    <TextField
                                        id="multiline-static"
                                        label="Message"
                                        multiline
                                        rows="15"
                                        defaultValue="Hi {{CandidateName}}, you have an interview on {{AppointmentDate}} with {{CompanyName}}"
                                        margin="normal"
                                        className={classes.textField}
                                        inputRef={(textField) => this.textField = textField}
                                    />

                                    <Button
                                        fab mini color="primary" aria-label="add"
                                        className={'menu-trigger'}
                                        onClick={this.handleClick.bind(this)}
                                    >
                                        <AddIcon />
                                    </Button>

                                    <Menu
                                        id="simple-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={this.handleClose.bind(this)}
                                    >
                                        {Object.keys(templateItems).map((key, index) =>
                                            <MenuItem
                                                key={`template-snippet-${index}`}
                                                onClick={this._handleTemplateSnippet.bind(this, key)}
                                            >
                                                {templateItems[key]}
                                            </MenuItem>
                                        )}
                                    </Menu>
                                </Grid>
                            </Grid>
                            
                            <div style={{ paddingBottom: '20px' }}>
                                <Grid container spacing={24}>
                                    <Grid item md={3}>
                                        <Typography type="title" style={{ margin: '30px 0 0 0' }} gutterBottom>
                                            Delivery Date/Time
                                        </Typography>

                                        <FormControlLabel
                                            checked={this.state.defaultReminder}
                                            onChange={(e) => this.setState({...this.state, defaultReminder: !this.state.defaultReminder})}
                                            control={<Checkbox value="checkedE" />}
                                            label="Interview Date and Time"
                                        />
                                        
                                        {remindersStack.map((item, index) =>
                                            <div key={`reminder-${index}`}>
                                                <Input
                                                    value={this.state.reminders[index]}
                                                    inputComponent={TextMaskCustom}
                                                    onChange={(e) => this._handleReminderChange(e, index)}
                                                    key={`reminder-${index}`}
                                                    inputProps={{
                                                        'aria-label': 'Reminder Input',
                                                    }}
                                                />

                                                {index === remindersStack.length - 1 &&
                                                    <Button
                                                        fab mini color="primary" aria-label="add"
                                                        className={'menu-trigger'}
                                                        onClick={this._addReminder.bind(this)}
                                                        style={{ width: '25px', minHeight: 0, height: '25px', marginLeft: '10px', marginBottom: '-6px' }}
                                                    >
                                                        <AddIcon style={{ width: '15px', height: '15px' }} />
                                                    </Button>
                                                }
                                            </div>
                                        )}
                                    </Grid>

                                    <Grid item md={9} className="create-textField">
                                        <Typography type="title" style={{ margin: '30px 0 0 0' }} gutterBottom>
                                            Status
                                        </Typography>

                                        <FormControlLabel
                                            checked={this.state.active}
                                            onChange={(e) => this.setState({...this.state, active: !this.state.active})}
                                            control={<Checkbox value="checkedE" />}
                                            label={this.state.active ? 'Active' : 'Disabled'}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        </div>

                        <CardActions style={{ borderTop: '1px solid #e4e4e4', height: 'auto' }}>
                            <Button raised color="accent" type="submit" style={{ margin: '10px' }}>
                            {editMode ? 'Update Record' : 'Create Record'}
                            </Button>
                        </CardActions>
                    </form>
                </Paper>
            </div>
        )
    }
}

CreateRuleComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
            }),
            // mapDispatchToProps
        )
    )(withStyles(styles)(CreateRuleComponent))