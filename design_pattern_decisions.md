# Design Pattern Decisions

(The Purchase-contract is based on the [Safe Remote Purchase Example](https://solidity.readthedocs.io/en/v0.4.24/solidity-by-example.html#safe-remote-purchase) )

### Fail Early, Fail Loud
- Wherever possible conditions where checked via require at the beginning of a function, so that an error is thrown if the condition isnt met. (e.g. to check if a product is in stock before ordering or if the store has enough balance for a withdrawal)
### Restrict Access
- Via Modifier onlyOwner, onlyAdminOrStoreOwner, onlyRole, onlyBuyer and onlySeller the access of most functions is restricted
### Auto Deprecation
- Auto Deprecation for Purchase-contracts was considered, but considered unnecessary. As long as the contract isnt locked the storeowner can always abort it and the money is transferred back to the store. After the contract is locked, both parties have a stake in the contract and have an interest in closing it. So there is no need to use auto deprecation especially if you consider long shipment times for products.
### Mortal
- The mortal design pattern was implemented through the Destructible-library from OpenZeppelin. Marketplace and Store are Destructible as a kind of last option in case something goes wrong. Purchase is not Destructible to keep a trade documented.
### Pull Payments over Push Payments (Withdrawal pattern)
- The Withdrawal pattern was implemented for the buyer in the Purchase-contract, so that a buyer can withdraw his stake in the contract after receival confirmation. 
- For the seller was a Withdrawal pattern considered. But since the money should be transferred back to the store-contract which has a payable fallback function and to avoid another transaction, no Withdrawal pattern was used in this case.
- The Store also allows withdrawal of money through the storeowner.
### Circuit Breaker
- A Circuit Breaker was implemented through the Pausable-library from OpenZeppelin. MarketPlace and Store are Pausable. All Getter-functions are still accessible when paused, but no Setter-functions are available. Also the payment and withdrawal of money is still available when paused.
- For the Purchase-contract a Circuit Breaker was considered. But this would only make sense if a third party  like a marketplace admin  would have the option to pause the contract to dissolve conflict between buyer and seller. To avoid integrating a third party in the Purchase-contract no Circuit Breaker was implemented here. Both the seller and the buyer have a stake in the contract. This should be enough incentive to settle disagreements between them.
### State machine
- The Pausable-Contract offers to states: paused and notPaused through a flag. So the Marketplace and Stores can be paused. When paused no state changing access is granted with the exception of payments.
- The Purchase-Contract has three states: Created, Locked and Inactive. While it is in the state Created the seller can abort the contract or the buyer can confirm it. After the confirmation the contract is locked with the payments of both. After the confirmation of product receival it is set to Inactive and the money is transferred back resp. can be withdrawn.
### Speed Bump
- The Speed Bump Pattern doesnt seem useful in the context of a store. 

### Further Patterns:
- **Contract Factory**
-- The Marketplace functions as factory for the Store contracts. 
-- The Store functions as factory for the Purchase contracts.
- **MultiSignature**
-- A MulitSig was considered to approve a new storeowner through multiple admins. But to avoid making the app more complicated to test it was discarded.
- **CRUD operations**
-- To manage the products the CRUD pattern described by Rob Hitchens was used: 
[Solidity CRUD Part 1](https://medium.com/@robhitchens/solidity-crud-part-1-824ffa69509a)
[Solidity CRUD Part 2](https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec)
