const Purchase = artifacts.require("./Purchase.sol");

require('chai')
    .use(require('chai-bignumber')(web3.BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

contract('Purchase', accounts => {

    let order;
    let secondOrder;
    
    beforeEach('setup contract for each test', async () => { 
        order = await Purchase.new(0, accounts[5], {from: accounts[7], value: 100000}); //accounts[5] = storeowner here, accounts[7] plays the store
    })

    it("...should allow the storeowner to abort the contract before it is locked.", async () => {      
        const { logs } = await order.abort({from: accounts[5]});
        var { event } = logs[0];
        event.should.equal('Aborted');
    });

    it("...should register the buyer on confirmation and set the state to locked", async () => {
        const { logs } = await order.confirmPurchase({from: accounts[6], value: 100000});
        var { event } = logs[0];
        event.should.equal('PurchaseConfirmed');
        var currentState = await order.state();
        assert.equal(currentState, 1, "The current state should be 1 = Locked");
    });

    it("...shouldn't allow the storeowner to abort the contract after it is confirmed.", async () => {
        await order.confirmPurchase({from: accounts[6], value: 100000});

        order.abort({from: accounts[5]})
            .then(assert.fail)
            .catch(function(error) {
               //do nothing - we expected an error
            });
    });

    it("...should let the buyer confirm the receival of the product and transfer the amount of (3 x price) to the store.", async () => {
        await order.confirmPurchase({from: accounts[6], value: 100000});
        var contractBalance = web3.eth.getBalance(order.address);
        await order.confirmReceived({from: accounts[6]});
        var expectedBalance = contractBalance - 150000;
        var newBalance = web3.eth.getBalance(order.address);
        assert.equal(newBalance, expectedBalance, "The contract should have a balance of 50000, the stake of the buyer");
    });

    it("...should allow the buyer to withdraw his stake of (1 x price).", async () => {
        await order.confirmPurchase({from: accounts[6], value: 100000});
        await order.confirmReceived({from: accounts[6]});
        var contractBalance = web3.eth.getBalance(order.address);
        await order.withdraw({from: accounts[6]});
        var newContractBalance = web3.eth.getBalance(order.address);
        assert.equal(contractBalance, 50000, "The contract should have a balance of 50000 Wei (1 x price).");
        assert.equal(newContractBalance, 0, "The contract should have a balance of 0 after the withdrawal.")
    })

});
