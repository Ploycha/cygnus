import React, { Fragment } from "react"
import { connect } from "react-redux"
import { appName } from "../StellarFox/env"
import { shorten } from "@xcmats/js-toolbox"
import {
    htmlEntities as he,
    pubKeyAbbrLedgerHQ,
    rgb,
} from "../../lib/utils"
import {
    Table,
    TableBody,
    TableRow,
    TableRowColumn,
} from "material-ui/Table"




// ...
export default connect(
    // map state to props.
    (state) => ({ balances: state.Balances, account: state.Account, })
)(
    ({ balances, account, assetManager, }) =>
        <Fragment>
            <div className="p-t p-b">
                Funds have arrived to the destination account.
            </div>

            <Table
                style={{
                    backgroundColor: rgb(244,176,4),
                }}
                selectable={false}
            >
                <TableBody displayRowCheckbox={false}>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Amount Sent:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            <span className="small">
                                {assetManager.getAssetGlyph(account.currency)}
                            </span>
                            <he.Nbsp />
                            {balances.amount}
                            <he.Nbsp /><he.Nbsp /><he.Nbsp />
                            <span className="tiny fade-extreme">
                                {balances.amountNative} XLM
                            </span>
                        </TableRowColumn>
                    </TableRow>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Payee Address:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            {balances.payeeAddress}
                        </TableRowColumn>
                    </TableRow>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Payee Account:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            {pubKeyAbbrLedgerHQ(balances.payee)}
                        </TableRowColumn>
                    </TableRow>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Memo Text:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            {balances.memoText}
                        </TableRowColumn>
                    </TableRow>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Transaction ID:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            {shorten(balances.paymentId, 35)}
                        </TableRowColumn>
                    </TableRow>
                    <TableRow className="table-row-primary">
                        <TableRowColumn className="text-normal text-primary">
                            Ledger Number:
                        </TableRowColumn>
                        <TableRowColumn className="text-normal fade">
                            {balances.ledgerId}
                        </TableRowColumn>
                    </TableRow>
                </TableBody>
            </Table>

            <div className="p-t fade small">
                Thank you for using {appName}.
            </div>
        </Fragment>
)
