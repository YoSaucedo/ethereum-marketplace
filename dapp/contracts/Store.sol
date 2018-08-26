pragma solidity ^0.4.22;

import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/lifecycle/Pausable.sol";
import "./zeppelin/lifecycle/Destructible.sol";
import "./Purchase.sol";

/** @title Store */
contract Store is Ownable, Pausable, Destructible {

    /* Store internals */
    bytes32 public store_name;                      // public => generated getter

    uint256 private currentId;                      //counter to give a product an id
    uint256[] private productIds;                   //Array of productIds to retrieve a product in products
    mapping (uint256 => Product) private products;  //mapping productId => struct Product

    mapping (uint256 => Order) private orders;
    uint256 private orderId;

    /* Store Events */
    event ProductAdded(uint256 indexed productId);
    event ProductUpdated(uint256 indexed productId, bytes32 name, bytes description, uint256 price, uint256 quantity);
    event ProductOrdered(uint256 indexed productId, address indexed purchaseContract, uint256 price);
    event ProductDeleted(uint256 indexed productId);
    event FundsWithdrew(uint256 amount, uint256 newBalance);
    event FundsPayed(address indexed sender, uint256 amount);


    struct Product {
        uint256 arrayIndex;
        bytes32 name;
        bytes description;
        uint256 price;
        uint256 quantity;
    }

    struct Order {
        address purchaseContract;
        uint256 productId;
    }


    /**
     * @dev Constructor, transfers the ownership of the store to the storeowner.
     * @param _name The name for the new store.
     * @param _owner The address of the storeowner.
     */
    constructor(bytes32 _name, address _owner) public {
        require(address(this).balance == 0, "The contract-balance wasn't 0.");
        transferOwnership(_owner);
        store_name = _name;
        currentId = 0;
    }

    /**
     * @dev Fetches the product ids.
     * @return An array of product ids.
     */
    function getProductIds() 
        public 
        view 
        returns(uint256[])
    {
        return productIds;
    }

    /**
     * @dev Fetches the data of one product.
     * @param id The product id.
     * @return The id, name, description, price and quantity of the product.
     */
    function getProduct(uint256 id) 
        public 
        view 
        returns (uint256, bytes32, bytes, uint256, uint256) 
    {
        return (
            id,
            products[id].name,
            products[id].description,
            products[id].price,
            products[id].quantity
        );
    }

    /**
     * @dev Adds a new product to the store.
     * @param name The name of the new product.
     * @param description A description for the new product.
     * @param price The price for the new product.
     * @param quantity The stock amount of the new product.
     */
    function addProduct(bytes32 name, bytes description, uint256 price, uint256 quantity) 
        public 
        whenNotPaused
        onlyOwner
    {
        Product memory product = Product(productIds.length, name, description, price, quantity);
        productIds.push(currentId);
        products[currentId] = product;
        emit ProductAdded(currentId);
        currentId++;
    }

    /**
     * @dev Updates the price of a product.
     * @param id The id of the product.
     * @param _price The new price for this product.
     */
    function updateProduct(uint256 id, uint256 _price) 
        public 
        whenNotPaused
        onlyOwner  
    {
        products[id].price = _price;
        emit ProductUpdated(products[id].arrayIndex, products[id].name, products[id].description, products[id].price, products[id].quantity);
    }

    /**
     * @dev Deletes a product from the store.
     * @param id The id of the product.
     */
    function deleteProduct(uint256 id) 
        public 
        whenNotPaused
        onlyOwner  
    {
        //save the arrayIndex of the item to delete
        uint256 indexToOverwrite = products[id].arrayIndex;
        // move the last item in the productIds to the index of the item to delete from the list
        uint256 productIdToMove = productIds[productIds.length-1];
        productIds[indexToOverwrite] = productIdToMove;
        //update arrayIndex of the old last item
        products[productIdToMove].arrayIndex = indexToOverwrite;
        //drop the last entry (which is now duplicated) of productIds
        productIds.length--;
        emit ProductDeleted(id);
    }

    /**
     * @dev Orders a product and creates a new Purchase-contract to document the order.
     * @param id The product id.
     * @return purchaseContract The address of the new Purchase-contract.
     */
    function orderProduct(uint256 id) 
        public 
        whenNotPaused
        returns (address purchaseContract) 
    {
        require(products[id].quantity > 0, "The product is not in stock.");
        uint256 stake = products[id].price * 2;
        products[id].quantity--; 
        Purchase newPurchase = (new Purchase).value(stake)(id, owner);
        
        orders[orderId] = Order(address(newPurchase), id);    
        emit ProductOrdered(id, address(newPurchase), products[id].price);
        orderId++;
        return address(newPurchase);
    }

    /** 
     * @dev Allows the storeowner to withdraw funds from the store.
     * @param amount The amount of money (in Wei) to be withdrawn.
     */
    function withdraw(uint256 amount) 
        public 
        onlyOwner 
    {
        require(address(this).balance >= amount, "The contract hasn't enough balance.");
        msg.sender.transfer(amount);
        emit FundsWithdrew(amount, address(this).balance);
    }

    /**
     * @dev Payable fallback function.
     */
    function() 
        public
        payable 
    {
        emit FundsPayed(msg.sender, msg.value);
    }
}