import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link, withRouter } from 'react-router-dom';
import * as storeownerSelectors from '../store/storeowner/reducer';
import * as  storeOwnerActions from '../store/storeowner/actions';
import ListView from '../components/ListView';
import ListRow from '../components/ListRow';
import * as loginSelectors from  '../store/login/reducer';
import LoginScreen from './LoginScreen';

class StoreOwnerScreen extends Component {

    constructor(props) {
        super(props);
        this.state= {
            newStoreName: ""
        };
    }

    componentDidMount() {
        this.props.dispatch(storeOwnerActions.fetchMyStoreIndex());
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.storesAddressArray.length !== this.props.storesAddressArray.length) {
            this.props.dispatch(storeOwnerActions.fetchStores(nextProps.storesAddressArray));
        }
    }

    render() {
        if (!this.props.loggedIn) {
            return <Redirect to='/' component={LoginScreen}/>;
        }
        return (
            <div className="StoreOwnerScreen">
                <h1>My Stores</h1>
                <div className="PostsScreen">
                    <div className="LeftPane">
                        <ListView
                            rowsIdArray={this.props.storesAddressArray}
                            rowsById={this.props.stores}
                            renderRow={this.renderRow} />
                    </div>
                </div>
                <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
                    <fieldset>      
                        <label htmlFor="store">Create a new store:</label>
                        <input id="store" type="text" value={this.state.newStoreName} onChange={this.onInputChange.bind(this)} placeholder="name" maxLength="32" />
                        <span className="pure-form-message">Enter the name of the new store.</span>
                        <br/>
                        <button type="submit" className="pure-button pure-button-primary">Create new store</button>
                    </fieldset>
                </form>
            </div>
        )
    }  

    renderRow(address, content) {
        if (content !== undefined) {
            return (
            <ListRow
                rowId={address}>
                <h3><Link to={{pathname: '/mystores/' + content.address, state: {store: content}}}>{content.name}</Link></h3>
            </ListRow>
            )
        }
    }

    onRowClick(address) {
        this.props.dispatch(storeOwnerActions.selectStore(address));
    }
    
    onInputChange(event) {
        this.setState({newStoreName: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.dispatch(storeOwnerActions.createStore(this.state.newStoreName));
    }

}

function mapStateToProps(state) {
    return {
        storesAddressArray: storeownerSelectors.getStoreAddresses(state),
        stores: storeownerSelectors.getStores(state),       // {address: {address: , name: , owner: }}
        isDataFetched: storeownerSelectors.isDataFetched(state),
        selectedStore: storeownerSelectors.getSelectedStoreByAddress(state),
        loggedIn: loginSelectors.isLoggedIn(state)
    };
}

export default withRouter(connect(mapStateToProps)(StoreOwnerScreen));