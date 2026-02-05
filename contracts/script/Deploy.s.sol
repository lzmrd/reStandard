//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.24;

import { Script, console }  from "forge-std/Script.sol";
import { RealEstateStablecoin  } from "../src/RealEstateStablecoin.sol";
import { PropertyRegistry } from "../src/PropertyRegister.sol";
import { PriceOracle } from "../src/PriceOracle.sol";
import { VaultManager } from "../src/VaultManager.sol";

contract Deploy is Script {
    function run() external {
        // USDC su Base Sepolia
        address usdc = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Deploying to Base Sepolia..");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy RealEstateStablecoin (RESD)
        RealEstateStablecoin resd = new RealEstateStablecoin();
        console.log("RESD deployed at ",address(resd));

        // 2. Deploy PropertyRegistry 
        PropertyRegistry registry = new PropertyRegistry();
        console.log("PropertyRegistry deplyed at: ", address(registry));

        // 3. Deploy PriceOracle
        PriceOracle oracle = new PriceOracle();
        console.log("PriceOracle deployed at: ", address(oracle));

        // 4. Deploy VaultManager
        VaultManager vaultManager = new VaultManager(
            address(resd),
            address(registry),
            address(oracle),
            usdc
        );
        console.log("VaultManager deployed at: ",address(vaultManager));
// 5. Set VaultManager as minter for RESD
        resd.setMinter(address(vaultManager));
        console.log("VaultManager set as RESD minter");
        
        // 6. Populate Oracle with initial prices (OMI data)
        _populateOracle(oracle);
        
        vm.stopBroadcast();
        
        // Print summary
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("RESD:             ", address(resd));
        console.log("PropertyRegistry: ", address(registry));
        console.log("PriceOracle:      ", address(oracle));
        console.log("VaultManager:     ", address(vaultManager));
        console.log("USDC:             ", usdc);
        console.log("===========================\n");
    }
    
    function _populateOracle(PriceOracle oracle) internal {
        // Prezzi OMI in USD (18 decimali) - già con conversione EUR→USD (×1.08)
        
        // ROMA
        oracle.updatePrice("RM", "ROMA", "A/2", 3780e18, "OMI");
        oracle.updatePrice("RM", "ROMA", "A/3", 3024e18, "OMI");
        oracle.updatePrice("RM", "ROMA", "A/7", 4536e18, "OMI");
        
        // MILANO
        oracle.updatePrice("MI", "MILANO", "A/2", 4860e18, "OMI");
        oracle.updatePrice("MI", "MILANO", "A/3", 3456e18, "OMI");
        
        // NAPOLI
        oracle.updatePrice("NA", "NAPOLI", "A/2", 2376e18, "OMI");
        oracle.updatePrice("NA", "NAPOLI", "A/3", 1944e18, "OMI");
        
        // FIRENZE
        oracle.updatePrice("FI", "FIRENZE", "A/2", 4104e18, "OMI");
        oracle.updatePrice("FI", "FIRENZE", "A/7", 4860e18, "OMI");
        
        // TORINO
        oracle.updatePrice("TO", "TORINO", "A/2", 2160e18, "OMI");
        oracle.updatePrice("TO", "TORINO", "A/3", 1620e18, "OMI");
        
        // BOLOGNA
        oracle.updatePrice("BO", "BOLOGNA", "A/2", 3456e18, "OMI");
        
        console.log("Oracle populated with OMI prices for 6 cities");
    }
}