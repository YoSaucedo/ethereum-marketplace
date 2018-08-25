const Store = artifacts.require("./Store.sol");

require('chai')
    .use(require('chai-bignumber')(web3.BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

contract('Store', accounts => {

    let store;
    
    beforeEach('setup contract for each test', async () => {
        store = await Store.new("Binford Tools", accounts[2]);
    })

    it("...should set the third account as owner.", async () => {
        assert.equal(await store.owner.call(), accounts[2], "The third account should be the store-owner.");
    });
    it("...should allow the storeowner to add a new product.", async () => {
        const { logs } = await store.addProduct("Item0", "Description", "2", "100", {from: accounts[2]});
        var { event, args } = logs[0];
        event.should.equal('ProductAdded');
        assert.equal(args.productId, 0, "The id of the new product should be 0.");
    });

    it("...should allow the storeowner to change the price of a product.", async () => {
        await store.addProduct("Item0", "Description", "3", "100", {from: accounts[2]});
        const { logs } = await store.updateProduct(0, 95, {from: accounts[2]});
        var { event, args } = logs[0];
        event.should.equal('ProductUpdated');
        assert.equal(args.price, 95, "The new price of the product should be 95.");
    });

    it("...should allow the storeowner to delete a product.", async () => {
        await store.addProduct("Item0", "Description", "3", "100", {from: accounts[2]});
        await store.addProduct("Item1", "Description", "3", "100", {from: accounts[2]});
        await store.addProduct("Item2", "Description", "3", "100", {from: accounts[2]});
        await store.addProduct("Item3", "Description", "3", "100", {from: accounts[2]});
        var index = await store.getProductIds({from: accounts[2]});
        assert.equal(index.length, 4, "The length of the index-array should be 4.");
        const { logs } = await store.deleteProduct(2, {from: accounts[2]});
        var { event, args } = logs[0];
        event.should.equal('ProductDeleted');
        index = await store.getProductIds({from: accounts[2]});
        assert.equal(index.length, 3, "The length of the index-array should be 3.");
    })

    it("...should be payable.", async () => {
        // send ether to store
        await store.send(web3.toWei(1, "ether"), {from: accounts[2]});
        var balance =  web3.eth.getBalance(store.address);
        assert.equal(balance, web3.toWei(1, "ether"), "The balance of the store should be 10000000000000000000 Wei.");
    });

    it("...should allow to buy products.", async () => {
        await store.send(web3.toWei(1, "ether"), {from: accounts[2]});
        await store.addProduct("Item0", "Description", "3", "100", {from: accounts[2]});
        await store.addProduct("Item1", "Description", "3", "100", {from: accounts[2]});
        const { logs } = await store.orderProduct(1, {from: accounts[5]});
        var { event, args } = logs[0];
        event.should.equal('ProductOrdered');
        assert.equal(args.productId, 1, "The id of the ordered product should be 1.");
    });

    it("...should allow the storeowner to withdraw money", async () => {
        await store.send(web3.toWei(2, "ether"), {from: accounts[2]});
        var storeBalance = web3.eth.getBalance(store.address);
        var expectedBalance = storeBalance - 1000000000000000000;
        await store.withdraw(web3.toWei(1, "ether"), {from: accounts[2]});
        var storeBalance2 = web3.eth.getBalance(store.address);
        assert.equal(storeBalance2, expectedBalance, "The balance of the store should contain one Ether less than before.");
    })


});
