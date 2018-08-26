pragma solidity ^0.4.22;

/** @title Purchase */
contract Purchase {
    uint256 public productId;
    uint public value;
    uint private withdrawalAmount;
    address public store;
    address public seller;
    address public buyer;
    enum State { Created, Locked, Inactive }
    State public state;

    // Events
    event Aborted();
    event OrderConfirmed();
    event PurchaseConfirmed();
    event ItemReceived();

    // Modifier
    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    modifier onlyBuyer() {
        require(
            msg.sender == buyer,
            "Only buyer can call this."
        );
        _;
    }

    modifier onlySeller() {
        require(
            msg.sender == seller,
            "Only seller can call this."
        );
        _;
    }

    modifier inState(State _state) {
        require(
            state == _state,
            "Invalid state."
        );
        _;
    }

    // Functions

    /**
     * @dev Constructor, sets the storeowner as seller and expects the store to send 2 x price along.
     * @param id The product id.
     * @param storeowner The address of the storeowner.
     */
    constructor(uint256 id, address storeowner) 
        public 
        payable 
    {
        store = msg.sender;
        seller = storeowner;
        productId = id;
        withdrawalAmount = 0;
        value = msg.value / 2; 
        require((2 * value) == msg.value, "Value has to be even.");
    }

    /**
     * @dev Allows the storeowner to abort the contract as long as it isn't locked yet.
     */
    function abort()
        public
        onlySeller
        inState(State.Created)
    {
        emit Aborted();
        state = State.Inactive;
        store.transfer(address(this).balance);
    }

    /**
     * @dev Confirm the purchase as buyer, expects 2 x price with the confirmation and locks the contract.
     */
    function confirmPurchase()
        public
        inState(State.Created)
        condition(msg.value == (2 * value))
        payable
    {
        emit PurchaseConfirmed();
        buyer = msg.sender;
        state = State.Locked;
    }

    /**
     * @dev Confirm the receival of the product as buyer, enables the buyer to withdraw his stake and sends the payment to the store.
     */
    function confirmReceived()
        public
        onlyBuyer
        inState(State.Locked)
    {
        emit ItemReceived();
        state = State.Inactive;
        withdrawalAmount = value;
        store.transfer(address(this).balance - value);
    }

    /**
     * @dev Allows the buyer to withdraw his stake after the receival confirmation.
     * @return true, if the money was transferred.
     */
    function withdraw() 
        public 
        onlyBuyer 
        returns (bool) 
    {
        uint amount = withdrawalAmount;
        withdrawalAmount = 0;
        msg.sender.transfer(amount);
        return true;
    }
}