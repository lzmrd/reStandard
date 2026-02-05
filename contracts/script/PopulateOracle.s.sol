//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { PriceOracle } from "../src/PriceOracle.sol";

contract PopulateOracle is Script {
    function run() external {
        // Indirizzo del PriceOracle deployato(da aggiornare dopo deploy)
        address oracleAddress = vm.envAddress("PRICE_ORACLE_ADDRESS");

        PriceOracle oracle = PriceOracle(oracleAddress);

        vm.startBroadcast();

        // Prezzi in USD con 18 decimali (es. 3500 USD = 3500e18)
        // Nota: i prezzi OMI sono in EUR, convertiamo assumendo EUR/USD

        // ROMA 
        oracle.updatePrice("RM", "ROMA", "A/2", 3780e18, "OMI"); // 3500 * 1.08
        oracle.updatePrice("RM", "ROMA", "A/3", 3024e18, "OMI"); // 2800 * 1.08
        oracle.updatePrice("RM", "ROMA", "A/7", 4536e18, "OMI"); // 4200 * 1.08
        
        // MILANO
        oracle.updatePrice("MI", "MILANO", "A/2", 4860e18, "OMI"); // 4500 * 1.08
        oracle.updatePrice("MI", "MILANO", "A/3", 3456e18, "OMI"); // 3200 * 1.08
        
        // NAPOLI
        oracle.updatePrice("NA", "NAPOLI", "A/2", 2376e18, "OMI"); // 2200 * 1.08
        oracle.updatePrice("NA", "NAPOLI", "A/3", 1944e18, "OMI"); // 1800 * 1.08
        
        // FIRENZE
        oracle.updatePrice("FI", "FIRENZE", "A/2", 4104e18, "OMI"); // 3800 * 1.08
        oracle.updatePrice("FI", "FIRENZE", "A/7", 4860e18, "OMI"); // 4500 * 1.08
        
        // TORINO
        oracle.updatePrice("TO", "TORINO", "A/2", 2160e18, "OMI"); // 2000 * 1.08
        oracle.updatePrice("TO", "TORINO", "A/3", 1620e18, "OMI"); // 1500 * 1.08
        
        // BOLOGNA
        oracle.updatePrice("BO", "BOLOGNA", "A/2", 3456e18, "OMI"); // 3200 * 1.08

        vm.startBroadcast();

        console.log("Oracle populated with OMI prices for 6 cities");
    }
}