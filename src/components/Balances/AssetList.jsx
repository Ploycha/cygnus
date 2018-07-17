import React, { Component } from "react"
import { connect } from "react-redux"
import { compose, bindActionCreators } from "redux"
import { parMap } from "@xcmats/js-toolbox"
import { BigNumber } from "bignumber.js"
import NumberFormat from "react-number-format"
import { assetLookup, htmlEntities as he, pubKeyAbbr } from "../../lib/utils"
import { maximumTrustLimit } from "../StellarFox/env"
import MD5 from "../../lib/md5"

import { Grid, Typography } from "@material-ui/core"

import { withAssetManager } from "../AssetManager"

import Paper from "../../lib/mui-v1/Paper"
import Avatar from "../../lib/mui-v1/Avatar"
import { loadAccount } from "../../lib/stellar-tx"
import VerifiedUser from "@material-ui/icons/VerifiedUser"
import { action as StellarAccountAction } from "../../redux/StellarAccount"




// <AssetList> component
export default compose(
    withAssetManager,
    connect(
        // map state to props
        (state) => ({
            assets: state.StellarAccount.assets,
            publicKey: state.StellarAccount.publicKey,
            horizon: state.StellarAccount.horizon,
        }),
        (dispatch) => bindActionCreators({
            setState: StellarAccountAction.setState,
        }, dispatch),
    )
)(
    class extends Component {

        // ..
        state = {
            assetTomlInfo: [],
            assets: [],
        }


        // ...
        componentDidMount = () => {
            parMap(
                this.props.assets,
                (asset) => this.assetAvatar(asset)).then(
                (results) => {
                    let stellarAssets = this.props.assets
                    let updatedAssets = results.map((r) => {
                        let assetToUpdate = stellarAssets.find((a) => 
                            a.asset_code === r.asset_code
                        )
                        assetToUpdate["avatar"] = r.avatar
                        assetToUpdate["decimals"] = r.decimals
                        assetToUpdate["verified"] = r.verified
                        return assetToUpdate
                    })
                    this.props.setState({
                        assets: updatedAssets,        
                    })
                })
        }


        // ...
        assetAvatar = async (asset) => {
            let issuingAccount = await loadAccount(
                asset.asset_issuer, this.props.horizon
            )

            if (issuingAccount.home_domain) {
                const assetInfo = await assetLookup(issuingAccount.home_domain)
                if (assetInfo) {
                    const assetIssuerInfo = assetInfo.find(
                        (a) => a.code === asset.asset_code
                    )
                    return {
                        asset_code: asset.asset_code,
                        avatar: assetIssuerInfo ?
                            assetIssuerInfo.image :
                            `https://www.gravatar.com/avatar/${MD5(
                                asset.asset_issuer
                            )}?s=42&d=identicon`,
                        decimals: assetIssuerInfo ?
                            assetIssuerInfo.display_decimals : 7,
                        verified: assetIssuerInfo ? true : false,
                    }
                }
            } else {
                return {
                    asset_code: asset.asset_code,
                    avatar: `https://www.gravatar.com/avatar/${MD5(
                        asset.asset_issuer
                    )}?s=42&d=identicon`,
                    decimals: 7,
                    verified: false,
                }
            }
        }


        // ...
        displayAvatar = (asset) =>            
            this.props.assets.find((a) =>
                a.asset_code === asset.asset_code
            ).avatar


        // ...
        displayVerified = (asset) =>
            this.props.assets.find((a) =>
                a.asset_code === asset.asset_code
            ).verified &&
                (<div className="f-b-col-c center">
                    <div>
                        <VerifiedUser
                            className="svg-success m-l-small"
                        />
                        <Typography variant="caption" color="secondary">
                            Verified
                        </Typography>
                    </div>
                </div>)
        


        // ...
        displayBalance = (asset) => {
            const decimals = this.props.assets.find((a) =>
                a.asset_code === asset.asset_code
            ).decimals

            return (<NumberFormat
                value={new BigNumber(asset.balance).toFixed(
                    decimals
                )}
                displayType={"text"} thousandSeparator={true}
                decimalScale={decimals}
                fixedDecimalScale={true}
            />)

        }


        // ...
        displayLimit = (asset) => {
            let assetInfoObj = this.props.assets.find((a) =>
                a.asset_code === asset.asset_code
            )

            let assetLimit = new BigNumber(asset.limit)

            return assetInfoObj && assetInfoObj.decimals ?
                assetLimit.isLessThan(maximumTrustLimit) ?
                    <NumberFormat
                        value={assetLimit.toFixed(assetInfoObj.decimals)}
                        displayType={"text"} thousandSeparator={true}
                        decimalScale={assetInfoObj.decimals}
                        fixedDecimalScale={true}
                    /> : "None" :
                asset.balance
        }


        // ...
        formatAssets = (assets) => assets.map((asset, index) =>
            <Grid item key={index} xs={12} sm={12} md={6} lg={6} xl={4}>
                <Paper color="primaryMaxWidth">
                    <div className="f-b-c space-between cursor-pointer">

                        <div className="p-l-small">
                            <Avatar src={this.displayAvatar(asset)} />
                        </div>

                        <div className="p-l-small">
                            {this.displayVerified(asset)}
                        </div>

                        <div className="p-l-small">
                            <div className="p-b-nano">
                                <Typography variant="caption"
                                    color="secondary"
                                >
                                    Issuer:<he.Nbsp /><he.Nbsp />
                                    {pubKeyAbbr(asset.asset_issuer)}
                                </Typography>
                            </div>

                            <Typography variant="subheading" color="secondary">
                                <span className="asset-balance">
                                    {this.displayBalance(asset)}
                                </span>
                                <span className="asset-code">
                                    {asset.asset_code}
                                </span>
                            </Typography>

                            <Typography variant="caption" color="secondary">
                                Trust Limit:<he.Nbsp /><he.Nbsp />
                                {this.displayLimit(asset)}
                            </Typography>

                        </div>
                    </div>
                </Paper>
            </Grid>
        )


        // ...
        render = () =>
            <Grid
                container
                alignContent="flex-start"
                alignItems="center"
                spacing={0}
            >
                { this.formatAssets(this.props.assets) }
            </Grid>

    }
)
