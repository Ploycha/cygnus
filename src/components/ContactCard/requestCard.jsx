import React, { Component } from "react"
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles"
import { bindActionCreators, compose } from "redux"
import { connect } from "react-redux"
import { action as ContactsAction } from "../../redux/Contacts"
import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import { gravatar, gravatarSize48 } from "../StellarFox/env"
import {
    pubKeyAbbr,
    changeContactStatus,
    getUserContacts,
    getUserExternalContacts,
    getContactRequests
} from "../../lib/utils"




// ...
const styles = (theme) => ({

    success: {
        color: theme.palette.success,
        backgroundColor: theme.palette.primaryColor,
        "&:hover": {
            backgroundColor: theme.palette.successHighlight,
            textShadow: `0px 0px 20px ${theme.palette.success}`,
        },
        marginLeft: "1.2rem",
        marginRight: "0.5rem",
    },

    danger: {
        color: theme.palette.danger,
        backgroundColor: theme.palette.primaryColor,
        "&:hover": {
            backgroundColor: theme.palette.dangerHighlight,
            textShadow: `0px 0px 20px ${theme.palette.danger}`,
        },
    },
})

// ...
const ActionButton = withStyles(styles)(
    ({ classes, onClick, color, label,}) =>
        <Button onClick={onClick} variant="raised"
            size="small" className={classes[color]}
        >
            <Typography noWrap variant="caption" color="inherit">
                {label}
            </Typography>
        </Button>
)


// ...
export default compose(
    connect(
        // map state to props.
        (state) => ({
            userId: state.LoginManager.userId,
            token: state.LoginManager.token,
        }),
        // match dispatch to props.
        (dispatch) => bindActionCreators({
            setState: ContactsAction.setState,
        }, dispatch)
    ),
    withStyles((theme) => ({
        root: theme.mixins.gutters({
            paddingTop: 16,
            paddingBottom: 16,
            minWidth: 250,
            backgroundColor: theme.palette.secondary.dark,
        }),

        avatar: {
            borderRadius: 3,
            width: 48,
            height: 48,
            border: `1px solid ${theme.palette.primary.dark}`,
        },

    }))
)(
    class extends Component {

        // ...
        static propTypes = {
            classes: PropTypes.object.isRequired,
        }


        // ...
        acceptContact = (contactId, requestedBy) => {
            changeContactStatus(
                this.props.userId, this.props.token, 2, contactId, requestedBy
            ).then((_response) => {
                getUserContacts(this.props.userId, this.props.token)
                    .then((results) => {
                        results ? this.props.setState({
                            internal: results,
                        }) : this.props.setState({
                            internal: [],
                        })
                    })
                getUserExternalContacts(this.props.userId, this.props.token)
                    .then((results) => {
                        results ? this.props.setState({
                            external: results,
                        }) : this.props.setState({
                            external: [],
                        })
                    })
                getContactRequests(this.props.userId, this.props.token)
                    .then((results) => {
                        results ? this.props.setState({
                            requests: results,
                        }) : this.props.setState({
                            requests: [],
                        })
                    })
            })
        }


        // ...
        rejectContact = (contactId, requestedBy) => {
            changeContactStatus(
                this.props.userId, this.props.token, 3, contactId, requestedBy
            ).then((_response) => {
                getContactRequests(this.props.userId, this.props.token)
                    .then((results) => {
                        results ? this.props.setState({
                            requests: results,
                        }) : this.props.setState({
                            requests: [],
                        })
                    })
            })

        }


        // ...
        render = () => (
            ({ classes, data, }) =>
                <Paper elevation={3}
                    className={classes.root}
                >
                    <div className="f-b space-between">
                        <Avatar className={classes.avatar}
                            src={`${gravatar}${data.email_md5}?${
                                gravatarSize48}&d=robohash`}
                        />
                        <div className="f-b">
                            <div className="f-e-col space-between">
                                <div className="f-e-col">
                                    <Typography align="right" noWrap>
                                        {data.first_name} {data.last_name}
                                    </Typography>
                                    <Typography variant="caption" align="right"
                                        noWrap
                                    >
                                        {data.alias}*{data.domain}
                                    </Typography>
                                </div>
                                <Typography variant="caption" align="right"
                                    noWrap
                                >
                                    {pubKeyAbbr(data.pubkey)}
                                </Typography>
                            </div>
                            <div className="f-e space-between">
                                <ActionButton onClick={this.acceptContact.bind(this, data.contact_id, data.requested_by)}
                                    variant="raised"
                                    color="success" size="small"
                                    label="Accept"
                                />

                                <ActionButton onClick={this.rejectContact.bind(this, data.contact_id, data.requested_by)}
                                    variant="raised"
                                    color="danger" size="small"
                                    label="Reject"
                                />
                            </div>
                        </div>
                    </div>
                </Paper>
        )(this.props)
    }
)
