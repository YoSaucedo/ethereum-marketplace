pragma solidity ^0.4.22;

contract Purchase {
    uint256 public productId;
    uint public value;
    uint private withdrawalAmount;
    address public store;
    address public seller;
    address public buyer;
    enum State { Created, Locked, Inactive }
    State public state;

    // Ensure that `msg.value` is an even number.
    // Division will truncate if it is an odd number.
    // Check via multiplication that it wasn't an odd number.
    constructor(uint256 id, address storeowner) 
        public 
        payable 
    {
        store = msg.sender;
        seller = storeowner;//msg.sender; //Store-Contract
        productId = id;
        withdrawalAmount = 0;
        value = msg.value / 2; //hier wird der Wert des Purchase-Contracts gesetzt als Hälfte des vom Verkäufer eingezahlten Wertes.
        require((2 * value) == msg.value, "Value has to be even.");
    }

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

    event Aborted();
    event OrderConfirmed();
    event PurchaseConfirmed();
    event ItemReceived();

    /// Abort the purchase and reclaim the ether.
    /// Can only be called by the seller before
    /// the contract is locked.
    function abort()
        public
        onlySeller
        inState(State.Created)
    {
        emit Aborted();
        state = State.Inactive;
        seller.transfer(address(this).balance);
    }

    /// Confirm the order as seller.
    /// Transaction has to include `2 * value` ether.
    /// The ether will be locked until confirmReceived
    /// is called.
    // function confirmOrder()
    //     public
    //     onlySeller
    //     inState(State.Created)
    //     condition(msg.value == (2 * value))
    //     payable
    // {
    //     emit OrderConfirmed();
    //     ///seller = msg.sender; Festlegen beim Vertrag erstellen und hier checken onlySeller
    //     if (address(this).balance == (4 * value)) {
    //         state = State.Locked;
    //     }
    // }

    /// Confirm the purchase as buyer.
    /// Transaction has to include `2 * value` ether.
    /// The ether will be locked until confirmReceived
    /// is called.
    function confirmPurchase()
        public
        inState(State.Created)
        condition(msg.value == (2 * value))
        payable
    {
        emit PurchaseConfirmed();
        buyer = msg.sender;
        // if (address(this).balance == (4 * value)) {
        state = State.Locked;
        // }
    }

    /// Confirm that you (the buyer) received the item.
    /// This will release the locked ether.
    function confirmReceived()
        public
        onlyBuyer
        inState(State.Locked)
    {
        emit ItemReceived();
        // It is important to change the state first because
        // otherwise, the contracts called using `send` below
        // can call in again here.
        state = State.Inactive;

        // NOTE: This actually allows both the buyer and the seller to
        // block the refund - the withdraw pattern should be used.

        // buyer.transfer(value);
        withdrawalAmount = value;
        // seller.transfer(address(this).balance);
        store.transfer(address(this).balance - value);
    }

    // Withdraw a bid that was overbid.
    //Withdraw anstelle von Transfer?
    function withdraw() 
        public 
        onlyBuyer 
        returns (bool) 
    {
        uint amount = withdrawalAmount;
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        withdrawalAmount = 0;
        msg.sender.transfer(amount);
        return true;
    }
}