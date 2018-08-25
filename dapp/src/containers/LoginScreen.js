import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as loginActions from '../store/login/actions';
import * as loginSelectors from '../store/login/reducer';
import { withRouter } from 'react-router-dom';


class LoginScreen extends Component {

    componentDidMount() {
        this.props.dispatch(loginActions.fetchWeb3());
    }

    render() {
        return (
            <div className="LoginScreen">
                <h1>Login</h1>
                <span>Please click the button to log in with MetaMask.</span><br/><br/>
                <button className="pure-button pure-button-primary" onClick={this.onLoginClick.bind(this)}>Login</button>
            </div>
        )
    }  
    
    onLoginClick() {
        this.props.dispatch(loginActions.fetchRole());
    }

}

function mapStateToProps(state) {
    return {
        web3: loginSelectors.getWeb3(state)
    };
}

export default withRouter(connect(mapStateToProps)(LoginScreen));