//SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { RealEstateStablecoin } from "../src/RealEstateStablecoin.sol";
import { PropertyRegistry } from "../src/PropertyRegister.sol";
import { PriceOracle } from "../src/PriceOracle.sol";
import { VaultManager } from "../src/VaultManager.sol";
import { Types } from "../src/libraries/Types.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";

contract E2ETest is Test {
    RealEstateStablecoin resd;
    PropertyRegistry registry;
    PriceOracle oracle;
    VaultManager vaultManager;
    ERC20Mock usdc;

    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address verifier = makeAddr("verifier");

    function setUp() public {
        // Deploy contracts
        resd = new RealEstateStablecoin();
        registry = new PropertyRegistry();
        oracle = new PriceOracle();
        usdc = new ERC20Mock("USD coin", "USDC", 6);

        vaultManager = new VaultManager(
            address(resd),
            address(registry),
            address(oracle),
            address(usdc)
        );

        // Setup permission
        resd.setMinter(address(vaultManager));
        registry.setVerifier(verifier);

        // Setup oracle
        oracle.updatePrice("RM", "ROMA", "A/2", 3000e18, "OMI");

        // Give Alice some USDC for recall
        usdc.mint(alice, 1_000_000e6);         //1M usdc
    }

    function test_FullFlow() public {
        // ============== 1. Alice registra proprietà ==================
        vm.startPrank(alice);
        
        bytes32 proofHash = keccak256("tls-notary-proof-alice");
        uint256 propertyId = registry.registerProperty(
            "123",          // foglio
            "456",          // particella
            "7",            // subalterno
            "A/2",          // categoria
            "ROMA",         // comune
            "RM",           // provincia
            proofHash
        );

        assertEq(propertyId, 0);
        vm.stopPrank();  


        // ================= 2. Verifier conferma la proof =========================
        vm.prank(verifier);
        registry.verifyProperty(propertyId);

        Types.Property memory prop = registry.getProperty(propertyId);
        assertTrue(prop.verified);

        // ==================== 3. Alice apre vault ==============================
        vm.startPrank(alice);

        uint256 vaultId = vaultManager.openVault(propertyId);
        assertEq(vaultId,1);

        Types.Vault memory vault = vaultManager.getVault(vaultId);
        assertEq(vault.owner, alice);
        assertEq(uint256(vault.status), uint256(Types.VaultStatus.Active));

        // ==================== 4. Verifica valore proprietà ==========================
        // 100mq x €3000/mq x 85% haircut = €255,000
        uint256 availableToMint = vaultManager.getAvailableToMint(vaultId);
        // maxDebt = €255,000 /1.5 = €170,000
        assertEq(availableToMint, 170_000e18);

        // =================== 5. Alice minta RESD =======================0000
        uint256 mintAmount = 50_000e18; // €50.000 RESD
        vaultManager.mint(vaultId,mintAmount);

        assertEq(resd.balanceOf(alice), mintAmount);

        vault = vaultManager.getVault(vaultId);
        assertEq(vault.debt, mintAmount);

        // Collateral ratio = 255k /50k = 510%
        uint256 ratio = vaultManager.getCollateralRatio(vaultId);
        assertEq(ratio, 51000); // 510% in bps

        // ================  6. Alice avvia recall ======================
        // Deve depositare 50k + 2% = 51k USDC
        // Ma USDC ha 6 decimali: 51_000e6
        usdc.approve(address(vaultManager), type(uint256).max);
        vaultManager.initiateRecall(vaultId);

        vault = vaultManager.getVault(vaultId);
        assertEq(uint256(vault.status), uint256(Types.VaultStatus.InRecall));

        Types.RecallRequest memory recall = vaultManager.getRecall(vaultId);
        assertEq(recall.totalUSDC, 51_000e6); //51k usdc

        vm.stopPrank();

        // ================== 7. Bob compra RESD da Alice e redime ==================
        // Simula Alice che trasferisce RESD a bob
        vm.prank(alice);
        resd.transfer(bob, 10_000e18);

        vm.startPrank(bob);

        // bob redime 10k RESD -> riceveeeeee 10.2k USDC (settimana 1, +2%)
        uint256 bobUsdcBefore = usdc.balanceOf(bob);
        vaultManager.redeemForStable(vaultId, 10_000e18);
        uint256 bobUsdcAfter = usdc.balanceOf(bob);

        // 10k RESD x 1.02 = 10.2k USDC 10_200e6
        assertEq(bobUsdcAfter - bobUsdcBefore, 10_200e6);
        assertEq(resd.balanceOf(bob), 0); //RESD bruciati

        vm.stopPrank();

        // ===================== 8. Passa il tempo Alice finalizza =====================
        // Alice ha ancora 40k RESD, li brucia per redimere
        vm.startPrank(alice);
        vaultManager.redeemForStable(vaultId, 40_000e18);
        vm.stopPrank();

        //Vault dovrebbe essere chiuso automaticamente (debt=0)
        vault = vaultManager.getVault(vaultId);
        assertEq(uint256(vault.status), uint256(Types.VaultStatus.Closed));
        assertEq(vault.debt, 0);

        console.log("===== E2E Test Passed =========");
        console.log("Property registered and verified");
        console.log("Vault opened, 50k RESD minted");
        console.log("Recall initiated with 51k USDC");
        console.log("Bob redeemed 10k RESD for 10.2k USDC");
        console.log("Alice redeemed 40k RESD, vault closed");
    }

    function test_RevertIfOverCollateralized() public {
        // Setup: ALice ha una proprietà verificata 
        vm.startPrank(alice);
        bytes32 proofHash = keccak256("proof");
        uint256 propertyId = registry.registerProperty("1", "2", "3", "A/2", "ROMA", "RM", proofHash);
        vm.stopPrank();

        vm.prank(verifier);
        registry.verifyProperty(propertyId);

        vm.startPrank(alice);
        uint256 vaultId = vaultManager.openVault(propertyId);

        // Prova a mintare più del massimo (170k)
        vm.expectRevert(abi.encodeWithSignature("BelowCollateralRatio()"));
        vaultManager.mint(vaultId, 200_000e18);

        vm.stopPrank();
    }

    function test_RevertIfNotVerified() public {
        vm.startPrank(alice);
        bytes32 proofHash = keccak256("proof");
        uint256 propertyId = registry.registerProperty(
            "1", "2", "3", "A/2", "ROMA", "RM", proofHash
        );

        // Prova ad aprire vault senza verifica 
        vm.expectRevert(abi.encodeWithSignature("PropertyNotVerified()"));
        vaultManager.openVault(propertyId);

        vm.stopPrank();
    }


}
