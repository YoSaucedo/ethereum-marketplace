import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link, withRouter } from 'react-router-dom';
import ListView from '../components/ListView';
import ListRow from '../components/ListRow';
import * as storeownerActions from '../store/storeowner/actions';
import * as storeownerSelectors from '../store/storeowner/reducer';
import * as loginSelectors from  '../store/login/reducer';
import LoginScreen from './LoginScreen';

class StoresScreen extends Component {

    componentDidMount() {
        this.props.dispatch(storeownerActions.fetchMyStoreIndex());
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.storesAddressArray.length !== this.props.storesAddressArray.length) {
            this.props.dispatch(storeownerActions.fetchStores(nextProps.storesAddressArray));
        }
    }

    render() {
        if (!this.props.loggedIn) {
            return <Redirect to='/' component={LoginScreen}/>;
        }
        return (
            <div className="StoresScreen">
                <h1>Stores</h1>
                <ListView
                    rowsIdArray={this.props.storesAddressArray}
                    rowsById={this.props.stores}
                    renderRow={this.renderRow} />
            </div>
        )
    }  

    renderRow(address, content) {
        if (content !== undefined) {
            return (
            <ListRow
                rowId={address}>
                <h3><Link to={{pathname: '/stores/' + content.address, state: {store: content}}}>{content.name}</Link></h3>
            </ListRow>
            )
        }
    }

}

function mapStateToProps(state) {
    return {
        storesAddressArray: storeownerSelectors.getStoreAddresses(state),
        stores: storeownerSelectors.getStores(state),       //{address: {address: , name: , owner: }}
        isDataFetched: storeownerSelectors.isDataFetched(state),
        selectedStore: storeownerSelectors.getSelectedStoreByAddress(state),
        loggedIn: loginSelectors.isLoggedIn(state)
    };
}

export default withRouter(connect(mapStateToProps) (StoresScreen));