import React, { Component } from 'react';
import '../css/StoreOwnerStore.css';

export default class ProductView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            price: undefined
        }
    }

    //gets called when a product is selected
    //so we have to write the price of the new product to the state
    componentWillReceiveProps(nextProps) {
        if (nextProps.length !== 0) {
            if(nextProps.product !== undefined) {
                this.setState( {price: nextProps.product.price} );
            }
        }
    }
    
    render() {
        if (!this.props.product) {
            return this.renderEmpty();
        } else {
            return this.renderProduct();
        }
    }

    renderEmpty() {
        return (
            <div>
                <h3>Select a product to view</h3>
                <br/><br/><br/>
            </div>
        );
    }

    renderProduct() {
        return (      
            <div>
                <h3>Selected Product:</h3><br/>
                <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
                    <label>Product-ID: </label>
                    <input type="text" value={this.props.product.id} readOnly="true"/>
                    <label>Name: </label>
                    <input type="text" className="field left" value={this.props.product.name} readOnly="true"/>
                    <label>Description: </label>
                    <textarea rows="4" cols="50" value={this.props.product.description} readOnly="true"/> 
                    <label>Quantity: </label>
                    <input type="text" value={this.props.product.quantity} readOnly="true"/>
                    <label>Price: </label>
                    <input type="number" value={this.state.price} min="1" onChange={this.onInputChange.bind(this)}/><br/>
                    <button type="submit" className="pure-button pure-button-primary">Change Price</button>
                    <button type="button" className="pure-button pure-button-primary" onClick={this.deleteProduct.bind(this)}>Delete Product</button>
                </form>
                <br/><br/><br/>
            </div>
        );
    }

    onInputChange(event) {
        this.setState({price: event.target.value});                     
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.updateProduct(this.props.product.id, this.state.price);
    }

    deleteProduct() {
        event.preventDefault();
        this.props.deleteProduct(this.props.product.id);
    }

}
