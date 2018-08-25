import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import * as  storeOwnerActions from '../store/storeowner/actions';
import * as storeownerSelectors from '../store/storeowner/reducer';
import ListView from '../components/ListView';
import ListRow from '../components/ListRow';
import ProductView from '../components/ProductView';
import FundsView from '../components/FundsView';
import '../css/StoreOwnerStore.css';
import * as loginSelectors from  '../store/login/reducer';
import LoginScreen from './LoginScreen';

class StoreOwnerStore extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
        const {store} = this.props.location.state; //props via Link, contain: address, name and storeowner
        // var address =  window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
        this.state= {
            store: store,
            newProduct: { 
                id: 0,
                name: "",
                description: "",
                price: 0,
                quantity: 0
            }
        };
    }

    componentDidMount() {
        this.props.dispatch(storeOwnerActions.fetchProductIndex(this.state.store.address));
        this.props.dispatch(storeOwnerActions.fetchBalance(this.state.store.address));
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
            <div className="StoreOwnerStore">
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
                        <ProductView product={this.props.currentProduct} updateProduct={this.updateProduct} deleteProduct={this.deleteProduct}/><br/>
                        <h3>Add a new product: </h3><br/>
                        <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
                            Product Name: <input type="text" name="name" value={this.state.newProduct.name} onChange={this.onInputChange.bind(this)} maxLength="32" />
                            Description: <textarea rows="4" cols="50" name="description" value={this.state.newProduct.description} onChange={this.onInputChange.bind(this)} />
                            Price in Wei: <input type="number" min="0" name="price" value={this.state.newProduct.price} onChange={this.onInputChange.bind(this)} />
                            Quantity: <input type="number" min="0" name="quantity" value={this.state.newProduct.quantity} onChange={this.onInputChange.bind(this)}/><br/>
                            <button type="submit" className="pure-button pure-button-primary">Add new product</button>
                        </form><br/><br/><br/>
                        <FundsView balance={this.props.balance} withdrawFunds={this.withdrawFunds}/>
                    </div>
                </div>
            </div>
        )
    }


    renderRow(id, product) {
        id = parseInt(id, 10);

        var selected = false;
        // set the product to selected if it is marked as the currentProduct
        if (this.props !== undefined) {    
            selected = (this.props.currentProduct === product);
        }
        //sometimes the content is still undefined at the first render-try
        if (product !== undefined) {
            var price = undefined;
            //on adding a new product the data sometimes are still missing on first rendertry
            if(product.id !== undefined) {
                id = product.id.toString();
                price = product.price.toString();
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

    updateProduct(id, price) {
        this.props.dispatch(storeOwnerActions.updateProduct(this.state.store.address, id, price));
    }

    deleteProduct(id) {
        this.props.dispatch(storeOwnerActions.deleteProduct(this.state.store.address, id));
    }

    onInputChange(event) {
        let newProduct = Object.assign({}, this.state.newProduct);  //copy newProduct from state
        newProduct[event.target.name] = event.target.value;         //set new value
        this.setState({newProduct});                                //save newProduct in state
    }

    onRowClick(id) {
        this.props.dispatch(storeOwnerActions.selectProduct(id));
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.dispatch(storeOwnerActions.addProduct(this.state.store.address, this.state.newProduct));
    }

    withdrawFunds(amount) {
        this.props.dispatch(storeOwnerActions.withdrawFunds(this.state.store.address, amount));
    }

}

function mapStateToProps(state) {
    return {
        productIds: storeownerSelectors.getProductIds(state),
        products: storeownerSelectors.getProducts(state),
        isProductsFetched: storeownerSelectors.isProductsFetched(state),
        currentProduct: storeownerSelectors.getCurrentProduct(state),
        balance: storeownerSelectors.getBalance(state),
        loggedIn: loginSelectors.isLoggedIn(state)
    };
}

export default connect(mapStateToProps) (StoreOwnerStore);