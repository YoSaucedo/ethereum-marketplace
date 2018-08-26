pragma solidity ^0.4.22;

import "./zeppelin/ownership/rbac/RBAC.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/lifecycle/Pausable.sol";
import "./zeppelin/lifecycle/Destructible.sol";
import "./Store.sol";

/** @title Marketplace */
contract MarketPlace is Ownable, RBAC, Pausable, Destructible {

    string constant ROLE_ADMIN = "admin";
    string constant ROLE_STOREOWNER = "storeOwner";


    // STORES
    struct StoreStruct { 
        bytes32 name;
        address storeOwner;
    }

    address[] private storeIndex;   // keys for stores-mapping
    mapping(address => StoreStruct) private stores;

    //map all the shop-addresses of one shop-owner to his address
    address[] private storeOwners;  // keys for myStores-mapping
    mapping(address => address[]) private myStores; 


    // Events
    event StoreAdded(
        address indexed store,
        address indexed from,
        bytes32 name
    );


    // Modifier
    modifier onlyAdminOrStoreOwner(address callingAddress, address storeOwner) {  
        bool isStoreOwner = hasRole(callingAddress, ROLE_STOREOWNER); 
        bool isAdmin = hasRole(callingAddress, ROLE_ADMIN);
        require(isStoreOwner || isAdmin);
        if(!isAdmin) {
            require(callingAddress == storeOwner);  //check if the storeowner just fetches his own data
        }
        _;
    }


    //Functions

    /**
     * @dev Constructor, adds the msg.sender as admin.
     */
    constructor() public {
        addRole(msg.sender, ROLE_ADMIN);

    }

    /**
     * @dev Gets the role for the msg.sender.
     * @return the number for the according role (0 for admin, 1 for storeowner, 2 for shopper).
     */
    function getRole() public view returns (uint) {
        bool isStoreOwner = hasRole(msg.sender, ROLE_STOREOWNER); 
        bool isAdmin = hasRole(msg.sender, ROLE_ADMIN);
        if (isAdmin)
            return 0;
        else if (isStoreOwner)
            return 1;
        else
            return 2; 
    }

   
    //USERS
    /**
     * @dev Adds the storeowner-role to the commited address.
     * @param storeOwner The address that shall be added as storeowner.
     */
    function addStoreOwner(address storeOwner) 
        public 
        whenNotPaused
        onlyRole(ROLE_ADMIN) 
    {
        addRole(storeOwner, ROLE_STOREOWNER);
        storeOwners.push(storeOwner);
    }

    /**
     * @dev Adds the admin-role to the commited address.
     * @param admin The address that shall be added as admin.
     */
    function addAdmin(address admin) 
        public 
        whenNotPaused
        onlyRole(ROLE_ADMIN) 
    {
        addRole(admin, ROLE_ADMIN);
    }

    /** 
     * @dev Fetches a list of all storeowners for admins.
     * @return storeOwners An array with the addresses of all storeowners.
     */
    function getStoreOwners() 
        public
        view 
        onlyRole(ROLE_ADMIN)  
        returns(address[]) 
    {
        return storeOwners;
    }

   
    //STORES

    /** 
     * @dev Creates a store for the message sender if he is registered as a storeowner.
     * @param _name The name of the new store.
     * @return newStore The address of the new store.
     */
    function createStore(bytes32 _name) 
        public 
        whenNotPaused
        onlyRole(ROLE_STOREOWNER)
        returns(address) 
    {
        Store newStore = new Store(_name, msg.sender); //create Store-contract
        address storeAddr = address(newStore);
        // create StoreStruct
        stores[storeAddr].name = _name;
        stores[storeAddr].storeOwner = msg.sender;
        storeIndex.push(storeAddr);
        // save Store in StoreOwner-Stores
        myStores[msg.sender].push(storeAddr);    

        emit StoreAdded(address(newStore), msg.sender, _name);
        return address(newStore);
    }

    /** 
     * @dev Fetches all stores that are owned by one address - if the call is from an admin or the storeowner himself.
     * @param _storeOwner The address of the storeowner.
     * @return An array with the store addresses of this storeowner.
     */
    function getStoresOf(address _storeOwner) 
        public
        view  
        onlyAdminOrStoreOwner(msg.sender, _storeOwner)
        returns(address[])
    {
        return myStores[_storeOwner];
    }

    /**
     * @dev Fetches all saved store-addresses.
     * @return An array with all saved store addresses. 
     */
    function getStoreIndex()
        public 
        view 
        returns(address[]) 
    {
        return storeIndex;
    }

    /**
     * @dev Fetches the data of one store.
     * @param storeAddress The address of the store.
     * @return The store address, store name and storeowner address for this shop.
     */
    function getStore(address storeAddress) 
        public
        view 
        returns (address, bytes32, address) 
    {
        return (
            storeAddress,
            stores[storeAddress].name,
            stores[storeAddress].storeOwner
        );
    }

}