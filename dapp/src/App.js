import React, { Component } from 'react';
import { connect } from 'react-redux';
import LoginScreen from './containers/LoginScreen';
import AdminScreen from './containers/AdminScreen';
import StoresScreen from './containers/StoresScreen';
import ProductsScreen from './containers/ProductsScreen';
import StoreOwnerScreen from './containers/StoreOwnerScreen';
import StoreOwnerStore from './containers/StoreOwnerStore';
import { Route, Switch, withRouter } from 'react-router-dom';
import * as loginSelectors from './store/login/reducer';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './css/App.css'


class App extends Component {

    constructor(props) {
        super(props);
        this.state= {
            roleString: ""
        };
    }

    componentWillReceiveProps(nextProps) {
        // only do something if the role has changed
        if (nextProps.role !== this.props.role) {
            // load the admin-screen if the admin has locked in
            // parseInt to parse the String role to an Integer!
            switch(parseInt(nextProps.role, 10)) {
                case loginSelectors.RoleEnum.admin: 
                    this.setState({roleString : "Admin"});
                    this.props.history.push('/admin');
                    break;
                case loginSelectors.RoleEnum.storeowner:
                    this.setState({roleString : "StoreOwner"});
                    this.props.history.push('/mystores'); 
                    break;
                case loginSelectors.RoleEnum.shopper:
                    this.setState({roleString : "Shopper"});
                    this.props.history.push('/stores');
                    break;
                default:
                    this.props.history.push('/stores');
            }
        }
    }

    render() {
        return (
            <div className="App">
                <h1>Nina's Marketplace</h1>
                { this.props.address ? <span>Logged in with { this.props.address } as {this.state.roleString}</span> : <span>You are not logged in!</span> }
                <br/><br/>
                <div className="content">
                    <Route exact path="/" component={LoginScreen}/>
                    <Route path="/admin" component={AdminScreen}/> 
                    <Switch>
                        <Route path="/stores/:address" component={ProductsScreen}/>
                        <Route path="/stores" component={StoresScreen}/>  
                    </Switch>  
                    <Switch>
                        <Route path="/mystores/:address" component={StoreOwnerStore}/> 
                        <Route path="/mystores" component={StoreOwnerScreen}/>      
                    </Switch>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        role: loginSelectors.getRole(state),
        address: loginSelectors.getAddress(state)
    };
}

export default withRouter(connect(mapStateToProps)(App));
