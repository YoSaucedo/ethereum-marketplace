pragma solidity ^0.4.22;

import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/lifecycle/Pausable.sol";
import "./zeppelin/lifecycle/Destructible.sol";
import "./Purchase.sol";


//TODO test updateProduct
//TODO test deleteProduct

//https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec
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


    /**
        @notice Represents a product:
        Product id: @id
        Product name: @name
        Decription: @description
        Amount of items in a single product: @default_amount
    */
    struct Product {
        uint256 arrayIndex;// das hier muss der arrayindex werden, damit ich weiß, an welcher Stelle im Array das Produkt hinterlegt ist.
        bytes32 name;
        bytes description;
        uint256 price;
        uint256 quantity;
    }

    struct Order {
        address purchaseContract;
        uint256 productId;
    }

    //Muss/Kann ich hier checken, dass der Sender ein ShopOwner ist?
    //The owner must be provided, since the MarketPlace-contract is creating the store.
    constructor(bytes32 _name, address _owner) public {
        require(address(this).balance == 0, "The contract-balance wasn't 0.");
        transferOwnership(_owner);
        // owner = _owner; //msg.sender ist der Factory-Vertrag, bzw muss der sein, das könnte ich per modifier checken
        store_name = _name;
        currentId = 0;
    }

    function getProductIds() 
        public 
        view 
        returns(uint256[])
    {
        return productIds;
    }

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

    function addProduct(bytes32 name, bytes description, uint256 price, uint256 quantity) 
        public 
        whenNotPaused
        onlyOwner
    {
        //check if price > 0?
        //productIds.length == arrayIndex where id of this product will be stored 
        Product memory product = Product(productIds.length, name, description, price, quantity);
        productIds.push(currentId);
        products[currentId] = product;
        emit ProductAdded(currentId);
        currentId++;
    }

    function updateProduct(uint256 id, uint256 _price) 
        public 
        whenNotPaused
        onlyOwner  
    {
        products[id].price = _price;
        emit ProductUpdated(products[id].arrayIndex, products[id].name, products[id].description, products[id].price, products[id].quantity);
    }

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

    function orderProduct(uint256 id) 
        public 
        whenNotPaused
        returns (address purchaseContract) 
    {
        //if (msg.value >= products[id].price) {
        //check if quantity is > 0!

        require(products[id].quantity > 0, "The product is not in stock.");
        uint256 stake = products[id].price * 2;
        Purchase newPurchase = (new Purchase).value(stake)(id, owner);
        products[id].quantity--; 
        //TODO kann ich den neuen contract nicht einfach in orders pushen? warum verwalte ich die orderId/orderId?
        orders[orderId] = Order(address(newPurchase), id);    
        emit ProductOrdered(id, address(newPurchase), products[id].price);
        orderId++;
        return address(newPurchase); //oder orderId returnen?
            // store_balance += products[id].price; //store_balance
            //debit their account => geben die nur die Erlaubnis den Preis einzuziehen und ich zieh ein?
            //TODO Geld ist jetzt schon auf diesem Contract wenn es als msg.value mitkam? also auf this.balance?
            //Was passiert wenn zu viel gezahlt wird? Was passiert wenn zu wenig gezahlt wird?

            //Hier eventuell einen Purchase Contract anlegen? Dann müsste der Store aber immer genug Kohle haben, um
            //das doppelte an Preis einzuzahlen... Nicht unbedingt nötig... Wir können dem Käufer eine revokePurchase
            //Funktion geben, wo dann ein Admin klären muss und der Verkäufer nachweisen muss, dass versendet und 
            //zugestellt wurde.
        //}
    }

    function withdraw(uint256 amount) 
        public 
        whenNotPaused
        onlyOwner 
    {
        require(address(this).balance >= amount, "The contract hasn't enough balance.");    //check if we have enough money
        //Integer Overflow/Underflow checken?
        msg.sender.transfer(amount);
        emit FundsWithdrew(amount, address(this).balance);
    }

    /**
        @notice Payable fallback - wird vom Purchase-Contract gentutzt um die Zahlung hier zu hinterlegen
    */
    function() 
        public
        payable 
        whenNotPaused 
    {
        emit FundsPayed(msg.sender, msg.value);
    }
}