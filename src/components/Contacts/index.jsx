import React, { Component, Fragment } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { emptyString } from "@xcmats/js-toolbox"
import { withStyles } from "@material-ui/core/styles"
import { Grid } from "@material-ui/core"
import ContactCard from "../ContactCard"
import ContactRequestCard from "../ContactCard/requestCard"
import ContactPendingCard from "../ContactCard/pendingCard"
import ContactBlockedCard from "../ContactCard/blockedCard"
import AddContactForm from "./AddContactForm"
import EditContactForm from "./EditContactForm"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import Fuse from "fuse.js"
import Icon from "@material-ui/core/Icon"
import Button from "@material-ui/core/Button"
import Modal from "@material-ui/core/Modal"
import { action as ContactsAction } from "../../redux/Contacts"
import { action as ModalAction } from "../../redux/Modal"
import { listInternal, listRequested, listPending, statusList, } from "./api"
import {
    getUserExternalContacts, sortBy,
} from "../../lib/utils"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Divider from "../../lib/mui-v1/Divider"
import { debounce } from "lodash"




// ...
const styles = (theme) => ({

    nocards: {
        color: theme.palette.secondary.dark,
        paddingLeft: "0.5rem",
        paddingTop: "0.5rem",
    },

    paper: {
        position: "absolute",
        width: theme.spacing.unit * 80,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[24],
        padding: theme.spacing.unit * 2,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "3px",
        "&:focus": {
            outline: "none",
        },
    },

    raised: {
        color: theme.palette.secondary.main,
        "&:hover": {
            backgroundColor: theme.palette.primary.light,
        },
        borderRadius: "3px",
        transition: "text-shadow 350ms ease-out, background-color 350ms ease",
        marginLeft: "1.5rem",
    },

    formControl: {
        margin: theme.spacing.unit,
        minWidth: "150px",
    },

    selectMenu: {
        zIndex: 1001,
        backgroundColor: theme.palette.secondary.light,
    },

    input: {
        color: theme.palette.primary.main,
        borderBottom: `1px solid ${theme.palette.primary.main}`,
        "&:focus": {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.secondary.main,
        },
    },

    textFieldInput: {
        color: theme.palette.primary.main,
        "&:hover:before": {
            borderBottomColor: `${theme.palette.primary.main} !important`,
            borderBottomWidth: "1px !important",
        },
        "&:before": { borderBottomColor: theme.palette.primary.main, },
        "&:after": { borderBottomColor: theme.palette.primary.main, },
    },

    inputMargin: {
        margin: "0px",
    },

    inputLabel: {
        color: theme.palette.primary.main,
        "&:focus": {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.secondary.main,
        },
    },

    selectIcon: {
        color: theme.palette.primary.main,
    },

    select: {
        borderBottom: `1px solid ${theme.palette.primary.main}`,
    },

    selectRoot: {
        backgroundColor: `${theme.palette.secondary.main} !important`,
    },

})




// ...
const AddContactModal = withStyles(styles)(
    ({ classes, onClose, modalId, visible, }) =>
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            open={ modalId === "addContact" && visible }
            onClose={onClose}
        >
            <div className={classes.paper}>
                <Typography variant="subheading" color="primary"
                    id="modal-title"
                >
                    Request New Contact
                </Typography>
                <AddContactForm />
            </div>
        </Modal>
)




// ...
const EditContactModal = withStyles(styles)(
    ({ classes, onClose, modalId, visible, details, }) =>
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            open={modalId === "editContact" && visible}
            onClose={onClose}
        >
            {details && details.external ?
                <div
                    style={{
                        background: "linear-gradient(90deg, rgb(244, 176, 4) 0%, rgb(138, 151, 175) 100%)",
                    }}
                    className={classes.paper}
                >
                    <Typography variant="subheading" color="primary" id="modal-title">
                        Federated Contact Details
                    </Typography>
                    <EditContactForm />
                </div> :
                <div className={classes.paper}>
                    <Typography variant="subheading" color="primary" id="modal-title">
                        Contact Details
                    </Typography>
                    <EditContactForm />
                </div>
            }
        </Modal>
)




// ...
const AddContactButton = withStyles(styles)(
    ({ classes, onClick, }) =>
        <Button onClick={onClick} variant="raised"
            color="primary" size="small" className={classes.raised}
        >
            <Icon style={{ marginRight: "3px", }}>
                add_box
            </Icon>
            <Typography noWrap variant="caption" color="inherit">
                Request New Contact
            </Typography>
        </Button>
)




// ...
const NoCards = withStyles(styles)(
    ({ classes, title, subtitle, }) =>
        <div className={classes.nocards}>
            <Typography noWrap  variant="body2" color="inherit">
                {title}
            </Typography>
            <Typography noWrap  variant="caption" color="inherit">
                {subtitle}
            </Typography>
        </div>
)




// ...
const SearchField = withStyles(styles)(
    ({ classes, label, onChange, value, }) => <TextField
        id="seach-by"
        label={label}
        value={value}
        type="search"
        margin="dense"
        onChange={onChange}
        InputProps={{
            classes: {
                input: classes.textFieldInput,
                underline: classes.textFieldInput,
            },
        }}
        InputLabelProps={{
            classes: {
                root: classes.textFieldInput,
                marginDense: classes.inputMargin,
            },
        }}
    />
)




// ...
const SelectView = withStyles(styles)(
    ({ classes, value, onChange, }) =>
        <FormControl className={classes.formControl}>
            <InputLabel classes={{shrink: classes.inputLabel,}}
                htmlFor="select-view"
            >👁 Select View</InputLabel>
            <Select
                classes={{
                    icon: classes.selectIcon,
                    select: classes.select,
                    root: classes.selectRoot,
                }}
                MenuProps={{
                    PopoverClasses: {
                        paper: classes.selectMenu,
                    },
                }}
                value={value}
                onChange={onChange}
                inputProps={{
                    name: "view",
                    id: "select-view",
                    className: classes.input,
                }}
            >
                <MenuItem value={0}>Everything</MenuItem>
                <MenuItem value={1}>Contacts Only</MenuItem>
                <MenuItem value={2}>Requests Only</MenuItem>
            </Select>
        </FormControl>
)




// <Contacts> component
class Contacts extends Component {

    // ...
    state = {
        search: emptyString(),
        error: false,
        errorMessage: emptyString(),
        selectedView: 0,
        sortBy: "first_name",
    }


    // ...
    componentDidMount = () =>
        this.userContacts(this.state.selectedView)


    // ...
    userContacts = () => {

        // list all user contacts
        this.state.selectedView === 0 &&
            listInternal(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        internal: results,
                    }) : this.props.setState({
                        internal: [],
                    })
                }) &&

            getUserExternalContacts(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        external: results,
                    }) : this.props.setState({
                        external: [],
                    })
                }) &&

            listRequested(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        requests: results,
                    }) : this.props.setState({
                        requests: [],
                    })
                }) &&

            listPending(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        pending: results,
                    }) : this.props.setState({
                        pending: [],
                    })
                })

        // list internal contacts only
        this.state.selectedView === 1 &&
            listInternal(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        internal: results,
                    }) : this.props.setState({
                        internal: [],
                    })
                })

        // list external contacts only
        this.state.selectedView === 2 &&
            getUserExternalContacts(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        external: results,
                    }) : this.props.setState({
                        external: [],
                    })
                })

        // list requested & pending
        this.state.selectedView === 3 &&
            listRequested(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        requests: results,
                    }) : this.props.setState({
                        requests: [],
                    })
                }) &&

            listPending(this.props.userId, this.props.token)
                .then((results) => {
                    results ? this.props.setState({
                        pending: results,
                    }) : this.props.setState({
                        pending: [],
                    })
                })

    }


    // ...
    showAllContacts = () => {
        if (this.props.contactsInternal.length === 0 &&
            this.props.contactsExternal.length === 0) {
            return (
                <NoCards title="You have no contacts at the moment."
                    subtitle="Click 'Add New Contact' to add some."
                />
            )
        }

        let contacts = []

        if (this.props.contactsInternal.length > 0) {
            contacts = contacts.concat(this.props.contactsInternal)
        }

        if (this.props.contactsExternal.length > 0) {
            contacts = contacts.concat(this.props.contactsExternal)
        }

        return contacts.sort(sortBy(this.state.sortBy)).map(
            (contact, index) =>
                <Grid item key={index + 1} xs={12} sm={12} md={4} lg={3}
                    xl={2}
                >
                    <ContactCard data={contact}
                        external={!contact.contact_id}
                    />
                </Grid>
        )
    }


    // ...
    showFilteredContacts = () => {
        let filteredInternal = new Fuse(this.props.contactsInternal, {
            keys: ["first_name", "last_name", "alias", "domain", "pubkey",],
            threshold: "0.2",
        }).search(this.state.search)

        let filteredExternal = new Fuse(this.props.contactsExternal, {
            keys: ["first_name", "last_name", "alias", "domain", "pubkey",],
            threshold: "0.2",
        }).search(this.state.search)

        if (filteredInternal.length === 0 && filteredExternal.length === 0) {
            return (
                <NoCards title="No contacts found."
                    subtitle="No external contacts were found matching this
                    search."
                />
            )
        }

        let filteredResults = []

        if (filteredInternal.length > 0) {
            filteredResults = filteredResults.concat(filteredInternal)
        }

        if (filteredExternal.length > 0) {
            filteredResults = filteredResults.concat(filteredExternal)
        }

        return filteredResults.sort(sortBy(this.state.sortBy)).map(
            (contact, index) =>
                <Grid item key={index + 1} xs={12} sm={12} md={4} lg={3}
                    xl={2}
                >
                    <ContactCard data={contact}
                        external={!contact.contact_id}
                    />
                </Grid>
        )
    }


    // ...
    showAllContactRequests = () => {
        if (this.props.contactRequests.length === 0 &&
            this.props.pending.length === 0) {
            return (
                <NoCards title="You have no contact requests at the moment."
                    subtitle="When someone requests you as a contact, it will
                    be listed here."
                />
            )

        }
        let requests = []

        if (this.props.contactRequests.length > 0) {
            requests = requests.concat(this.props.contactRequests)
        }

        if (this.props.pending.length > 0) {
            requests = requests.concat(this.props.pending)
        }

        return requests.sort(sortBy(this.state.sortBy)).map(
            (contact, index) =>
                <Grid item key={index + 1} xs={12} sm={12} md={4} lg={3}
                    xl={2}
                >
                    {contact.status === statusList.REQUESTED &&
                        <ContactRequestCard data={contact} />
                    }
                    {contact.status === statusList.PENDING &&
                        <ContactPendingCard data={contact} />
                    }
                    {(contact.status === statusList.BLOCKED) &&
                        <ContactBlockedCard data={contact} />
                    }
                </Grid>
        )
    }


    // ...
    showFilteredContactRequests = () => {

        let searchRequests = new Fuse(this.props.contactRequests, {
            keys: ["first_name", "last_name", "alias", "domain", "pubkey",],
            threshold: "0.2",
        }).search(this.state.search)

        let searchPending = new Fuse(this.props.pending, {
            keys: ["first_name", "last_name", "alias", "domain", "pubkey",],
            threshold: "0.2",
        }).search(this.state.search)

        if (searchRequests.length === 0 && searchPending.length === 0) {
            return (
                <NoCards title="No contact requests found."
                    subtitle="No contact requests were found matching this
                    search."
                />
            )
        }

        let searchResults = []

        if (searchRequests.length > 0) {
            searchResults = searchResults.concat(searchRequests)
        }

        if (searchPending.length > 0) {
            searchResults = searchResults.concat(searchPending)
        }

        return searchResults.sort(sortBy(this.state.sortBy)).map(
            (contact, index) =>
                <Grid item key={index} xs={12} sm={12} md={4} lg={3} xl={2}>
                    {contact.status === statusList.REQUESTED &&
                        <ContactRequestCard data={contact} />
                    }
                    {contact.status === statusList.PENDING &&
                        <ContactPendingCard data={contact} />
                    }
                    {contact.status === statusList.BLOCKED &&
                        <ContactBlockedCard data={contact} />
                    }
                </Grid>
        )

    }


    // ...
    updateSearchFilter = debounce((search) => {
        this.setState({ search, })
    }, 300)


    // ...
    showModal = () => this.props.showModal("addContact")


    // ...
    changeView = (event) => {
        this.setState({ selectedView: event.target.value, }, () => {
            this.userContacts()
        })
    }


    // ...
    render = () =>
        <Fragment>

            <AppBar position="static" color="inherit">
                <Toolbar>

                    <div style={{flex: 1,}} className="f-b-col m-r">
                        <Typography noWrap variant="title" color="primary">
                            Contact Book
                        </Typography>
                        <Typography noWrap variant="body1" color="primary">
                                Your financial contacts.
                        </Typography>
                    </div>


                    <AddContactButton onClick={this.showModal} />


                    <div style={{ marginLeft: "2rem", }}>
                        <div className="f-e space-between">
                            <SearchField label="🔍 Search Contact Book"
                                onChange={e => this.updateSearchFilter(
                                    e.target.value
                                )}
                            />
                            <SelectView value={this.state.selectedView}
                                onChange={this.changeView}
                            />
                        </div>
                    </div>

                </Toolbar>

            </AppBar>

            <AddContactModal modalId={this.props.Modal.modalId}
                visible={this.props.Modal.visible} onClose={this.hideModal}
            />

            <EditContactModal modalId={this.props.Modal.modalId}
                visible={this.props.Modal.visible} onClose={this.hideModal}
                details={this.props.contactDetails}
            />

            {this.state.selectedView === 0 &&
                <Fragment>
                    <div className="m-t-medium">
                        <Typography variant="body2" color="secondary">
                            Contacts
                        </Typography>
                        <Divider color="secondary" />
                    </div>
                    <Grid
                        container
                        alignContent="flex-start"
                        alignItems="center"
                        spacing={16}
                    >
                        {this.state.search.length > 0 ?
                            this.showFilteredContacts() :
                            this.showAllContacts()
                        }
                    </Grid>
                    <div className="m-t-medium">
                        <Typography variant="body2" color="secondary">
                            Requests
                        </Typography>
                        <Divider color="secondary" />
                    </div>
                    <Grid
                        container
                        alignContent="flex-start"
                        alignItems="center"
                        spacing={16}
                    >
                        {this.state.search.length > 0 ?
                            this.showFilteredContactRequests() :
                            this.showAllContactRequests()
                        }
                    </Grid>
                </Fragment>
            }

            {this.state.selectedView === 1 &&
                <Fragment>
                    <div className="m-t-medium">
                        <Typography variant="body2" color="secondary">
                            Contacts
                        </Typography>
                        <Divider color="secondary" />
                    </div>
                    <Grid
                        container
                        alignContent="flex-start"
                        alignItems="center"
                        spacing={16}
                    >
                        {this.state.search.length > 0 ?
                            this.showFilteredContacts() :
                            this.showAllContacts()
                        }
                    </Grid>
                </Fragment>
            }

            {this.state.selectedView === 2 &&
                <Fragment>
                    <div className="m-t-medium">
                        <Typography variant="body2" color="secondary">
                            Requests
                        </Typography>
                        <Divider color="secondary" />
                    </div>
                    <Grid
                        container
                        alignContent="flex-start"
                        alignItems="center"
                        spacing={16}
                    >
                        {this.state.search.length > 0 ?
                            this.showFilteredContactRequests() :
                            this.showAllContactRequests()
                        }
                    </Grid>
                </Fragment>
            }

        </Fragment>
}




// ...
export default connect(
    // map state to props
    (state) => ({
        token: state.LoginManager.token,
        userId: state.LoginManager.userId,
        Modal: state.Modal,
        contactsInternal: state.Contacts.internal,
        contactsExternal: state.Contacts.external,
        contactRequests: state.Contacts.requests,
        pending: state.Contacts.pending,
        contactDetails: state.Contacts.details,
    }),
    (dispatch) => bindActionCreators({
        setState: ContactsAction.setState,
        hideModal: ModalAction.hideModal,
        showModal: ModalAction.showModal,
    }, dispatch)
)(Contacts)
