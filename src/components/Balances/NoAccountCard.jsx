import React, { Component, Fragment } from "react"
import {
    bindActionCreators,
    compose,
} from "redux"
import { connect } from "react-redux"
import { withAssetManager } from "../AssetManager"
import { notImplementedText } from "../StellarFox/env"
import {
    Card,
    CardActions,
    CardHeader,
    CardText,
} from "material-ui/Card"
import Button from "../../lib/mui-v1/Button"
import { action as AlertAction } from "../../redux/Alert"
import { action as BalancesAction } from "../../redux/Balances"
import { Typography } from "@material-ui/core"
import NumberFormat from "react-number-format"



// <NoAccountCard> component
class NoAccountCard extends Component {

    // ...
    componentDidMount = () => {
        this.props.assetManager.updateExchangeRate(this.props.Account.currency)
    }

    // ...
    showNotImplementedModal = () =>
        this.props.showAlert(notImplementedText, "Not Yet Implemented")


    // ...
    toggleFundCard = () =>
        this.props.setState({
            fundCardVisible: !this.props.Balances.fundCardVisible,
        })


    // ...
    render = () => <Card className="account">
        <CardHeader
            title={
                <Typography variant="subtitle1" color="primary">
                    Current Balance
                </Typography>
            }
            subtitle={
                <Fragment>
                    <Typography variant="subtitle2" color="primary">
                        {this.props
                            .assetManager.getAssetDescription(
                                this.props.Account.currency
                            )}
                        <span className="fade-strong currency-iso p-l-medium">
                            {this.props.Account.currency.toUpperCase()}
                        </span>
                    </Typography>
                </Fragment>
            }
            actAsExpander={false}
            showExpandableButton={false}
        />

        <CardText>
            <div className="flex-box-row">
                <div className="text-primary">
                    <span className="fade currency-glyph">
                        {
                            this.props.assetManager.getAssetGlyph(
                                this.props.Account.currency
                            )
                        }
                    </span>
                    <span className="p-l-medium balance tabular-nums">
                        0.00
                    </span>
                </div>
            </div>


            <Typography color="primary" variant="h5"
                className="fade-extreme"
            >
                <NumberFormat
                    value={0.0000000}
                    displayType={"text"}
                    thousandSeparator={true}
                    decimalScale={7}
                    fixedDecimalScale={true}
                /> XLM
            </Typography>
            <Typography color="primary" variant="h5"
                className="fade-extreme"
            >
                1 XLM ≈ <NumberFormat
                    value={this.props.assetManager
                        .convertToAsset("1.0000000")
                    }
                    displayType={"text"}
                    thousandSeparator={true}
                    decimalScale={2}
                    fixedDecimalScale={true}
                /> {this.props.assetManager.getAssetGlyph(
                    this.props.Account.currency)}
            </Typography>

        </CardText>

        <CardActions>
            <Button
                onClick={this.toggleFundCard}
                color="success"
            >Fund</Button>
            <Button
                onClick={this.showNotImplementedModal}
                color="warning"
            >Request</Button>
        </CardActions>
    </Card>

}


// ...
export default compose(
    withAssetManager,
    connect(
        // map state to props.
        (state) => ({
            Account: state.Account,
            Balances: state.Balances,
        }),
        // map dispatch to props.
        (dispatch) => bindActionCreators({
            setState: BalancesAction.setState,
            showAlert: AlertAction.showAlert,
        }, dispatch)
    )
)(NoAccountCard)
