// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IncidentManager } from "../src/IncidentContract.sol";
import { BaseScript } from "./Base.s.sol";
import { console } from "forge-std/console.sol";

/// @title DeployIncidentManager
/// @notice Deployment script for IncidentManager contract using standard deployment
contract DeployIncidentManager is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return incidentManager The deployed IncidentManager contract instance
    /// @dev This contract has no constructor arguments, making deployment straightforward

    function run() public broadcast returns (IncidentManager incidentManager) {
        // Deploy the contract - no constructor arguments needed
        incidentManager = new IncidentManager();

        // Log deployment information
        console.log("IncidentManager deployed to:", address(incidentManager));
        console.log("Incident Counter initialized to:", incidentManager.incidentCounter());

        // Verify deployment was successful
        if (address(incidentManager) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
    }
}
