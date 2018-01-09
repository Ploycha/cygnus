import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'
import {connect} from 'react-redux'
import './Content.css'

import Balances from './Balances'
import Payments from './Payments'
import Account from './Account'


class Content extends Component {
  render() {
    return (
      <div style={{
        paddingLeft: this.props.drawer ? 200 : 20
      }} className='content'>
      <Switch>
        <Route exact path="/" component={Balances}/>
        <Route exact path="/payments" component={Payments}/>
        <Route exact path="/account" component={Account}/>
      </Switch>


      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    view: state.selectedView,
    drawer: state.drawerState,
  }
}

export default connect(mapStateToProps)(Content)
