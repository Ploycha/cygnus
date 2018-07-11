import React, { Component, Fragment } from "react"
import BigNumber from "bignumber.js"
import { connect } from "react-redux"
import { withStyles } from "@material-ui/core/styles"
import Button from "../../lib/mui-v1/Button"
import { CardElement, injectStripe } from "react-stripe-elements"
import InputField from "../../lib/mui-v1/InputField"
import {
    CircularProgress, FormControl, InputLabel, MenuItem, Select
} from "@material-ui/core"
import { htmlEntities as he } from "../../lib/utils"
import { fundAccount } from "./api"
import "./index.css"



// ...
const styles = (theme) => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: "150px",
        maxWidth: "150px",
        paddingBottom: theme.spacing.unit * 2,
    },

    input: {
        color: theme.palette.primary.main,
        borderBottom: `1px solid ${theme.palette.primary.main}`,
        "&:focus": {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.secondary.main,
        },
    },

    inputLabel: {
        color: theme.palette.primary.main,
        "&:focus": {
            color: theme.palette.primary.main,
        },
    },

    select: {
        "&:focus": {
            textShadow: "none",
        },
    },

    selectMenu: {
        zIndex: 1001,
        backgroundColor: theme.palette.secondary.light,
    },

    icon: {
        color: theme.palette.primary.fade,
    },
})




// ...
const SelectView = withStyles(styles)(
    ({ classes, value, onChange, }) =>
        <FormControl className={classes.formControl}>
            <InputLabel classes={{
                root: classes.inputLabel, shrink: classes.inputLabel,
            }} htmlFor="select-view"
            >Select Currency</InputLabel>
            <Select
                classes={{
                    select: classes.select,
                    icon: classes.icon,
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
                <MenuItem value="eur">EUR</MenuItem>
                <MenuItem value="usd">USD</MenuItem>
                <MenuItem value="aud">AUD</MenuItem>
            </Select>
        </FormControl>
)



// ...
class CheckoutForm extends Component {

    // ...
    constructor (props) {
        super(props)
        this.submit = this.submit.bind(this)
        this.state = {
            amount: "0",
            error: false,
            errorMessage: "",
            selectedCurrency: "eur",
            inProgress: false,
        }
    }


    // ...
    async submit (_ev) {
        this.setState({
            inProgress: true,
        })
        let { token, } = await this.props.stripe.createToken({ name: "Name", })

        const charge = {
            token: token.id,
            amount: (new BigNumber(this.state.amount).times(100).toString()),
            currency: this.state.selectedCurrency,
        }

        fundAccount(this.props.userId, this.props.token, charge)
            .then((response) => {
                // eslint-disable-next-line no-console
                console.log(response)
            })
            .catch((error) => {
                this.setState({
                    error: true,
                    errorMessage: error.response.data.error,
                })
            })
            .finally(() => {
                this.setState({
                    inProgress: false,
                })
            })

    }


    // ...
    changeCurrency = (event) => this.setState({
        selectedCurrency: event.target.value,
    })


    // ...
    updateInputValue = (event) => {
        if (!/^(\d+)([.](\d{1,2}))?$/.test(event.target.value)) {
            this.setState({
                error: true,
                errorMessage: "Invalid amount entered.",
            })
        } else {
            this.setState({
                error: false,
                errorMessage: "",
                amount: event.target.value,
            })
        }
    }


    // ...
    render = () =>
        <Fragment>
            <div className="f-b-c">
                <InputField
                    id="payment-amount"
                    type="text"
                    label="Amount"
                    color="primary"
                    error={this.state.error}
                    errorMessage={this.state.errorMessage}
                    onChange={this.updateInputValue}
                />
                <he.Nbsp /><he.Nbsp /><he.Nbsp /><he.Nbsp />
                <SelectView value={this.state.selectedCurrency}
                    onChange={this.changeCurrency}
                />
            </div>
            <div className="f-b-c">
                <div className="stripe-checkout">
                    <CardElement />
                </div>
                <div>
                    <Button
                        color="primary"
                        onClick={this.submit}
                        disabled={this.state.inProgress}
                    >
                        {this.state.inProgress ? <CircularProgress
                            color="primary" thickness={4} size={20}
                        /> : "Charge"}
                    </Button>
                </div>
            </div>
        </Fragment>

}




// ...
export default injectStripe(connect(
    (state) => ({
        userId: state.LoginManager.userId,
        token: state.LoginManager.token,
    })
)(CheckoutForm))
