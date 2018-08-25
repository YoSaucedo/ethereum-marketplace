import React, { Component } from 'react';
import '../css/StoreOwnerStore.css';

export default class FundstView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: 0
        }
    }
    
    render() {
        return (      
            <div>
                <h3>Store Balance:</h3><br/>
                <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
                    <label>Current Balance in Wei: </label>
                    <input type="number" value={this.props.balance} readOnly="true"/>
                    <label>Specify amount to withdraw in Wei: </label>
                    <input type="number" value={this.state.amount} min="0" max={this.props.balance} onChange={this.onInputChange.bind(this)}/><br/>
                    <button type="submit" className="pure-button pure-button-primary">Withdraw</button>
                </form>
                <br/>
                <div>Each store needs a balance to sell products. 
                    For each order a deposit of the double amount of the product price is made. 
                    After the buyer has confirmed the product receival the store gets the triple amount of the product price back.</div>
                <br/><br/>
            </div>
        );
    }

    onInputChange(event) {
        this.setState({amount: event.target.value});                     
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.withdrawFunds(this.state.amount);
    }

}
