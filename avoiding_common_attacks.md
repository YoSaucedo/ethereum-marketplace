# Avoiding common attacks
### 1. Race Conditions
##### a) Reentrancy
- To avoid repeated withdrawal from the Purchase-contract (withdraw function), the withdrawal-amount is set to zero and then the amount is sent to the buyer.
- The Purchase-contract transfers the money to the Store-contract after the confirmation receival, so here is no reentrancy possible.
- To avoid buying products that are out of stock (Store-contract, orderProduct function), the product-quantity is decreased before the Purchase-contract is created.
##### b) Cross-function Race Conditions
- Because the withdrawal of money is organized in one function, there is no possibility of cross-function race conditions.
- The price of a product could be changed during the execution of an orderProduct-call. This is not avoidable. But the buyer could check the amount which the store payed to the contract and decide to not confirm the purchase at this price. 
### 2. Transaction Ordering Dependence (TOD) / Front Running
- Transaction Ordering Dependence should be no problem here. When a buyer buys a product a Purchase-contract is set up and the store immediately pays the double amount of the products price to this contract. So the storeowner has no possibility to change the price of this order at a later time.
### 3. Timestamp Dependence
- Timestamp Dependence is irrelevant here.
### 4. Integer Overflow and Underflow
- An Integer overflow at the product ids is possible. But you would have to add 2^256 products to the store to overwrite the first products. This problem can be neglected.
- Since the storeowner manages the prices of the products and the prices are saved as uint256 there shouldnt be any concerns with overflow/underflow here.
- Through dynamic arrays: The product description is stored in a dynamic array, so it would be possible for the to manipulate the variable before the description. But the description cant be changed at the moment. Even if it would be changeable at a later time, it would only be possible to manipulate the variable before the description (the name of the product) and it would only be possible for the storeowner who has an interest in saving the correct data.
### 5. DoS with (unexpected) revert
- To avoid reversion the Withdrawal-Pattern is used in the Purchase-contract for the buyer. To the Store-contract the money Is transferred, but this is always possible  even if the Store-contract is paused. Should the Store-contract be destructed, the confirmReceived-function would fail, but this is not in the interest of the storeowner since he has money in the Purchase-contract.
### 6. DoS with Block Gas Limit
- To avoid running out of gas, products are updated individually.
- The only action where the whole array of product-ids must be updated is when a product is deleted. To avoid running through the whole array, the arrayIndex of each product is saved in the Product-struct. When a product shall be deleted, the last product-id in the array is copied to the product-id that shall be deleted and then the last element of the array is removed. This approach is described in detail here: [Solidity CRUD Part 2](https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec)
### 7. Forcible Sending Ether to a Contract
- To avoid problems with accounting, it is checked if the balance of a store is 0 on creation. Otherwise the Store-contract can always receive money without any implications for other functions.
- The Purchase-contract is only payable on creation and when the buyer confirms the purchase. The payment on creation determines the price of the order. On confirmation the right payment amount is checked via a modifier. So the Purchase-contract should always have the right amount of money.
