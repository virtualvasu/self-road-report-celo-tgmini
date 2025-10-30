// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IncidentManager {

    // Contract owner (deployer)
    address public owner;
    
    // Reward amount for verified incidents
    uint256 public rewardAmount = 0.05 ether; // 0.05 CELO (sepolia testnet)
    
    // Track if reward has been claimed for each incident
    mapping(uint256 => bool) public rewardClaimed;

    // Struct to store incident data
    struct Incident {
        uint id;
        string description;
        address reportedBy;
        uint256 timestamp;
        bool verified;
    }

    // Mapping from incident ID to Incident
    mapping(uint => Incident) public incidents;
    // Counter for generating unique incident IDs
    uint public incidentCounter;

    // Event to log new incidents
    event IncidentReported(uint id, string description, address reportedBy, uint256 timestamp);
    // Event to log incident verification
    event IncidentVerified(uint id, address verifiedBy);
    // Event to log reward payments
    event RewardPaid(uint indexed incidentId, address indexed reporter, uint256 amount);

    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    // Constructor to set the contract deployer as owner
    constructor() {
        owner = msg.sender;
    }

    // Function to report a new incident
    function reportIncident(string memory _description) public {
        incidentCounter++;
        incidents[incidentCounter] = Incident({
            id: incidentCounter,
            description: _description,
            reportedBy: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });

        emit IncidentReported(incidentCounter, _description, msg.sender, block.timestamp);
    }

    // Function to fetch incident data by ID
    function getIncident(uint _id) public view returns (uint, string memory, address, uint256, bool) {
        Incident memory incident = incidents[_id];
        return (incident.id, incident.description, incident.reportedBy, incident.timestamp, incident.verified);
    }

    // Function to mark an incident as verified (only owner can call this)
    function verifyIncident(uint _id) public onlyOwner {
        require(_id > 0 && _id <= incidentCounter, "Invalid incident ID");
        require(!incidents[_id].verified, "Incident is already verified");
        require(!rewardClaimed[_id], "Reward already claimed");
        require(address(this).balance >= rewardAmount, "Insufficient contract balance for reward");
        
        incidents[_id].verified = true;
        rewardClaimed[_id] = true;
        
        // Send reward to reporter
        address reporter = incidents[_id].reportedBy;
        (bool success, ) = payable(reporter).call{value: rewardAmount}("");
        require(success, "Reward transfer failed");
        
        emit IncidentVerified(_id, msg.sender);
        emit RewardPaid(_id, reporter, rewardAmount);
    }

    // Function to fetch the last incident's ID number
    function getLastIncidentId() public view returns (uint) {
        return incidentCounter;
    }
    
    // Allow owner to deposit CELO for rewards
    receive() external payable {}
    
    // Function to set reward amount (only owner)
    function setRewardAmount(uint256 _amount) public onlyOwner {
        rewardAmount = _amount;
    }
    
    // Function to withdraw funds (only owner)
    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Function to get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}