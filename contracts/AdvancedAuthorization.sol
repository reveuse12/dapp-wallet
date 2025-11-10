// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdvancedAuthorization {
    struct Authorization {
        bool isAuthorized;
        uint256 expirationTime;
        uint256 amountLimit;
    }
    
    // Mapping to store user authorizations for admins
    // userAddress => adminAddress => Authorization
    mapping(address => mapping(address => Authorization)) public authorizations;
    
    // Mapping to store admin addresses
    mapping(address => bool) public isAdmin;
    
    // Mapping to store all admins a user has authorized
    // userAddress => adminAddresses[]
    mapping(address => address[]) public userAdmins;
    
    // Mapping to track admin index in userAdmins array for efficient removal
    // userAddress => adminAddress => index
    mapping(address => mapping(address => uint256)) public adminIndex;
    
    // Events
    event AdminAuthorized(
        address indexed user, 
        address indexed admin, 
        uint256 expirationTime,
        uint256 amountLimit
    );
    event AdminRevoked(address indexed user, address indexed admin);
    event AdminRegistered(address indexed admin);
    event FundsTransferred(address indexed from, address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admins can perform this action");
        _;
    }
    
    modifier onlyAuthorized(address user) {
        require(
            authorizations[user][msg.sender].isAuthorized && 
            (authorizations[user][msg.sender].expirationTime == 0 || 
             authorizations[user][msg.sender].expirationTime > block.timestamp),
            "Not authorized or authorization expired"
        );
        _;
    }
    
    // Constructor to set the initial admin
    constructor(address initialAdmin) {
        isAdmin[initialAdmin] = true;
        emit AdminRegistered(initialAdmin);
    }
    
    // Register a new admin (only callable by existing admins)
    function registerAdmin(address newAdmin) public onlyAdmin {
        isAdmin[newAdmin] = true;
        emit AdminRegistered(newAdmin);
    }
    
    // Authorize an admin to access user's funds with expiration and amount limit
    function authorizeAdmin(
        address admin, 
        uint256 expirationTime, // 0 for no expiration
        uint256 amountLimit // 0 for no limit
    ) public {
        require(isAdmin[admin], "Address is not registered as admin");
        require(!authorizations[msg.sender][admin].isAuthorized, "Admin already authorized");
        
        authorizations[msg.sender][admin] = Authorization({
            isAuthorized: true,
            expirationTime: expirationTime,
            amountLimit: amountLimit
        });
        
        userAdmins[msg.sender].push(admin);
        adminIndex[msg.sender][admin] = userAdmins[msg.sender].length - 1;
        
        emit AdminAuthorized(msg.sender, admin, expirationTime, amountLimit);
    }
    
    // Revoke admin access
    function revokeAdmin(address admin) public {
        require(authorizations[msg.sender][admin].isAuthorized, "Admin not authorized");
        
        delete authorizations[msg.sender][admin];
        
        // Remove admin from userAdmins array
        uint256 index = adminIndex[msg.sender][admin];
        uint256 lastIndex = userAdmins[msg.sender].length - 1;
        
        if (index != lastIndex) {
            address lastAdmin = userAdmins[msg.sender][lastIndex];
            userAdmins[msg.sender][index] = lastAdmin;
            adminIndex[msg.sender][lastAdmin] = index;
        }
        
        userAdmins[msg.sender].pop();
        delete adminIndex[msg.sender][admin];
        
        emit AdminRevoked(msg.sender, admin);
    }
    
    // Check if an admin is authorized for a user
    function isAuthorized(address user, address admin) public view returns (bool) {
        return authorizations[user][admin].isAuthorized && 
               (authorizations[user][admin].expirationTime == 0 || 
                authorizations[user][admin].expirationTime > block.timestamp);
    }
    
    // Get authorization details
    function getAuthorization(address user, address admin) public view returns (Authorization memory) {
        return authorizations[user][admin];
    }
    
    // Get all authorized admins for a user
    function getAuthorizedAdmins(address user) public view returns (address[] memory) {
        return userAdmins[user];
    }
    
    // Transfer funds from user to admin (admin executes this)
    function transferFromUser(address user, uint256 amount) public onlyAuthorized(user) {
        Authorization storage auth = authorizations[user][msg.sender];
        
        // Check amount limit
        require(
            auth.amountLimit == 0 || amount <= auth.amountLimit,
            "Transfer amount exceeds limit"
        );
        
        // Update amount limit
        if (auth.amountLimit > 0) {
            auth.amountLimit -= amount;
        }
        
        // Transfer funds (this is a simplified version)
        // In practice, you would interact with a token contract or use native currency
        payable(msg.sender).transfer(amount);
        
        emit FundsTransferred(user, msg.sender, amount);
    }
    
    // Fallback function to receive Ether
    receive() external payable {}
    
    // Function to get contract balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}