import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import * as adminActions from '../store/admin/actions';
import * as adminSelectors from '../store/admin/reducer';
import * as loginSelectors from  '../store/login/reducer';
import LoginScreen from './LoginScreen';

class AdminScreen extends Component {

    constructor(props) {
        super(props);
        this.state= {
            address: ""
        };
    }

    componentDidMount() {
        this.props.dispatch(adminActions.fetchStoreOwners());
    }

    render() {
        let rows = [];
        if (!this.props.storeowners) return this.renderLoading();
        if (this.props.storeowners === undefined) return this.renderLoading();
        for (var i = 0; i < this.props.storeowners.length; i++) {
            rows.push(<tr key={i}><td key={this.props.storeowners[i]}>{this.props.storeowners[i]}</td></tr>)
        }
        if (!this.props.loggedIn) {
            return <Redirect to='/' component={LoginScreen}/>;
        }
        return (
            <div className="AdminScreen">
                <h1>Manage StoreOwners</h1>
                <div className="container">
                    <div className="row">
                        <div className="col s12 board">
                            <table id="simple-board">
                                <thead>
                                    <tr>
                                        <th>StoreOwner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
                        <fieldset>      
                            <label htmlFor="address">Add a new storeowner:</label>
                            <input id="address" type="text" value={this.state.address} onChange={this.onInputChange.bind(this)} />
                            <span className="pure-form-message">Enter the Ethereum address of the storeowner.</span>
                            <br />
                            <button type="submit" className="pure-button pure-button-primary">Add StoreOwner</button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }  
    
    onInputChange(event) {
        this.setState({address: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault()
        if (this.state.address.length < 42) {
            return alert('Please fill in an Ethereum address.')
        }
        this.props.dispatch(adminActions.addStoreOwner(this.state.address));
    }

    renderLoading() {
        return (
            <p>Loading...</p>
        );
    }

    renderNoUsers() {
        return (
            <p>There are no StoreOwners...</p>
        );
    }

    renderRow(row) {
        return (
            <div>
                <h3>{row.title}</h3>
                <p>{row.description}</p>
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {
        storeowners: adminSelectors.getStoreOwners(state),
        isDataFetched: adminSelectors.isDataFetched(state),
        loggedIn: loginSelectors.isLoggedIn(state)
    };
}

export default withRouter(connect(mapStateToProps)(AdminScreen));