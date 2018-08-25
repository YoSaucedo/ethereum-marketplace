import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import * as storeOwnerActions from '../store/storeowner/actions';
import * as shopperActions from '../store/shopper/actions';
import * as storeownerSelectors from '../store/storeowner/reducer';
import * as shopperSelectors from '../store/shopper/reducer';
import ListView from '../components/ListView';
import ListRow from '../components/ListRow';
import BuyProductView from '../components/BuyProductView';
import '../css/StoreOwnerStore.css';
import * as loginSelectors from  '../store/login/reducer';
import LoginScreen from './LoginScreen';

class ProductsScreen extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
        const {store} = this.props.location.state; // props via link, contain: address, name and storeowner!
        this.state= {
            store: store,
        };
    }

    componentDidMount() {   
        this.props.dispatch(storeOwnerActions.fetchProductIndex(this.state.store.address));
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.productIds.length !== this.props.productIds.length) {
            this.props.dispatch(storeOwnerActions.fetchProducts(this.state.store.address, nextProps.productIds));
        }
    }

    render() {
        if (!this.props.loggedIn) {
            return <Redirect to='/' component={LoginScreen}/>;
        }
        return (
            <div className="ProductsScreen">
                <h1>{this.state.store.name}</h1>
                <h2>Products</h2>
                <div className="PostsScreen">
                    <div className="LeftPane">
                        <ListView
                            rowsIdArray={this.props.productIds}
                            rowsById={this.props.products}
                            renderRow={this.renderRow} />
                    </div>
                    <div className="ContentPane">
                        <BuyProductView product={this.props.currentProduct} buyProduct={this.buyProduct}/><br/>
                        {this.props.orderId ? (
                            <div>An order with the id {this.props.orderId} has been opened.
                                You have to pay the double amount of the order value to ensure that you will confirm upon
                                product-receival. You can withdraw the overpayed amount after the receival-confirmation.
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    renderRow(id, product) {
        var selected = false;
        // set the product to selected if it is marked as the currentProduct
        if (this.props !== undefined) {    
            selected = (this.props.currentProduct === product);
        }
        //sometimes the content is still undefined at the first render-try
        if (product !== undefined) {
            var price = undefined;
            var quantity = undefined;
            //on adding a new product the data sometimes are still missing on first rendertry
            if(product.id !== undefined) {
                id = product.id.toString();
                price = product.price.toString();
                quantity = parseInt(product.quantity, 10);
            }
            //only show items that are in stock
            if (quantity < 1) {
                return;
            }
            return (
            <ListRow
                rowId={id}
                onClick={this.onRowClick}
                selected={selected}>
                <h3>{id} -  {product.name} - {price} Wei</h3>
            </ListRow>
            )
        }
    }

    buyProduct(id, price) {
        this.props.dispatch(shopperActions.buyProduct(this.state.store.address, id, price));
    }

    onRowClick(id) {
        this.props.dispatch(storeOwnerActions.selectProduct(id));
    }

}

function mapStateToProps(state) {
    return {
        productIds: storeownerSelectors.getProductIds(state),
        products: storeownerSelectors.getProducts(state),
        isProductsFetched: storeownerSelectors.isProductsFetched(state),
        currentProduct: storeownerSelectors.getCurrentProduct(state),
        orderId: shopperSelectors.getOrderId(state),
        loggedIn: loginSelectors.isLoggedIn(state)
    };
}

export default connect(mapStateToProps) (ProductsScreen);