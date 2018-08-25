const MarketPlace = artifacts.require("./MarketPlace.sol");

require('chai')
    .use(require('chai-bignumber')(web3.BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

contract('MarketPlace', accounts => {

    let marketPlace;

    beforeEach('setup contract for each test', async () => {
        marketPlace = await MarketPlace.deployed();
    })

    it("...should set the first account as owner.", async () => {
        const result = await marketPlace.getStoreOwners.call();

        assert.equal(await marketPlace.owner.call(), accounts[0], "The first account should be the MarketPlace-owner.");
        assert.equal(result.length, 0, "There should be no storeowners registered yet." + result);
    });

    it("...should return the role of the requesting address.", async () => {
        const result = await marketPlace.getRole.call();
        assert.equal(result, 0, "The first account should be registered as admin.");
    });

    it("...should allow admins to register another admin.", async () => {
        await marketPlace.addAdmin(accounts[1], {from: accounts[0]});
    });

    it("...should allow admins to register a storeowner.", async () => {
        await marketPlace.addStoreOwner(accounts[2], {from: accounts[0]});
        const result = await marketPlace.getStoreOwners.call();

        result.should.deep.equal([accounts[2]]);
    }); 

    it("...should return the registered storeowners.", async () => {
        await marketPlace.addStoreOwner(accounts[3], {from: accounts[0]});
        await marketPlace.addStoreOwner(accounts[4], {from: accounts[0]});
        const result = await marketPlace.getStoreOwners.call();
        result.should.deep.equal([accounts[2], accounts[3], accounts[4]]);
    });

    it("...should allow the storeowner to create a new store.", async () => {
        var { logs } = await marketPlace.createStore("Binford Tools", {from: accounts[2]});
        var { event, args } = logs[1];
        event.should.equal('StoreAdded');
        var name = web3.toAscii(args.name);
        var result = name.localeCompare("Binford Tools");
        assert.equal(result, 0, "The name of the shop should be 'Binford Tools'");
    });

    it("...should return the store-addresses of one storeowner for an admin.", async () => {
        await marketPlace.createStore("Paul's Petshop", {from: accounts[2]});
        await marketPlace.createStore("Moe's Tavern", {from: accounts[2]});
        await marketPlace.createStore("Ida's Italian Goods", {from: accounts[2]});
        const result = await marketPlace.getStoresOf(accounts[2]); 
        assert.equal(result.length, 4, "The storeowner should have 4 registered stores.");
    });

    it("...should return the store-addresses of one storeowner for the storeowner", async () => {
        const marketPlace = await MarketPlace.deployed();
        const result = await marketPlace.getStoresOf(accounts[2], {from: accounts[2]}); 
        assert.equal(result.length, 4, "The storeowner should have 4 registered stores.");
    });

    it("...should return all store-addresses.", async () => {
        // const marketPlace = 
        await marketPlace.createStore("Benni's Bar", {from: accounts[3]});
        await marketPlace.createStore("Binford Tools", {from: accounts[4]});
        const result = await marketPlace.getStoreIndex();
        assert.equal(result.length, 6, "There should be 6 registered stores.");
    })

    it("...should return the data for one specific store.", async () => {
        var { logs } = await marketPlace.createStore("Toystore", {from: accounts[2]});
        var { args } = logs[1];
        var address = args.store;
        var data = await marketPlace.getStore(address, {from: accounts[2]});
        assert.equal(data[2], accounts[2], "The storeowner-address should be the third account");
    })

});
