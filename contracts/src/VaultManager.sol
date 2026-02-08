// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Types } from "./libraries/Types.sol";
import { RealEstateStablecoin } from "./RealEstateStablecoin.sol";
import { PropertyRegistry } from "./PropertyRegister.sol";
import { PriceOracle } from "./PriceOracle.sol";

/// @title VaultManager
/// @notice Core del sistema CSP: gestisce vault, mint/burn RESD, e recall mechanism
contract VaultManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    //================= Constansts ====================

    /// @notice Collateral ratio minimo per mintare (150% = 15000 bps)
    uint public constant COLLATERAL_RATIO = 15000;
    
    /// @notice Ratio sotto il quale il vault è liquidabile (130% = 13000 bps)
    uint256 public constant LIQUIDATION_RATIO = 13000;

    /// @notice Durata del periodo di recall (30 giorni)
    uint public constant RECALL_PERIOD = 30 days;

    /// @notice Premium recall settimana 1(2% = 200 bps)
    uint256 public constant RECALL_PREMIUM_WEEK1 = 200;

    /// @notice Premium recall settimana 2-3 (1% = 100 bps)
    uint256 public constant RECALL_PREMIUM_WEEK2 = 100;

    /// @notice Debt minimo per vault (1000 RESD)
    uint256 public constant MIN_DEBT = 1000 * 1e18;

    // ================ State =====================

    RealEstateStablecoin public immutable resd;
    PropertyRegistry public immutable registry;
    PriceOracle public immutable oracle;
    IERC20 public immutable usdc;

    // @notice Contatore incrementale per Vault ID
    uint256 public nextVaultId;

    /// @notice vaultId => Vault
    mapping(uint256 => Types.Vault) public vaults;

    /// @notice owner => lista di vaultId
    mapping(address => uint256[]) public ownerVaults;

    /// @notice propertyId => vaultId (una proprietà può avere un solo vault attivo)
    mapping(uint256 => uint256) public propertyToVault;

    /// @notice vaultId => RecallRequest
    mapping(uint256 => Types.RecallRequest) public recalls;



    // ============ Errors ============

    error NotVaultOwner();
    error VaultNotActive();
    error VaultNotFound();
    error PropertyNotVerified();
    error PropertyAlreadyUsed();
    error NotPropertyOwner();
    error BelowCollateralRatio();
    error BelowMinDebt();
    error InsufficientDebt();
    error RecallAlreadyActive();
    error RecallNotActive();
    error RecallNotExpired();
    error InsufficientUSDC();
    error ZeroAmount();


    // ================ Events =====================
    event VaultOpened(uint256 indexed vaultId, address indexed owner, uint256 indexed propertyId);
    event Minted(uint256 indexed vaultId, address indexed to, uint256 amount);
    event Burned(uint256 indexed vaultId, address indexed from, uint256 amount);
    event VaultClosed(uint256 indexed vaultId);
    event RecallInitiated(uint256 indexed vaultId, uint256 indexed totalUSDC, uint256 deadline);
    event Redeemed(uint256 indexed vaultId, address indexed holder, uint256 resdAmount, uint256 usdcAmount);
    event RecallFinalized(uint256 indexed vaultId, uint256 unclaimedUSDC);

    // ============= Constructor ===================
    constructor(
        address _resd,
        address _registry,
        address _oracle,
        address _usdc
    ) Ownable(msg.sender) {
        resd = RealEstateStablecoin(_resd);
        registry = PropertyRegistry(_registry);
        oracle = PriceOracle(_oracle);
        usdc = IERC20(_usdc);
    }

    // =============== Vault Core ==================

    /// @notice Apre un nuovo Vault usando una proprietà come collaterale
    /// @param propertyId della proprietà PropertyRegistry
    function openVault(uint256 propertyId) external returns (uint256 vaultId) {
        Types.Property memory prop = registry.getProperty(propertyId);

        // Verifiche
        if (prop.owner != msg.sender) revert NotPropertyOwner();
        if (!prop.verified) revert PropertyNotVerified();
        if (propertyToVault[propertyId] != 0) revert PropertyAlreadyUsed();

        // Crea vault
        vaultId = ++nextVaultId;  // inizia da 1, così 0 = "non esiste"
        vaults[vaultId] = Types.Vault({
            PropertyId: propertyId,
            owner: msg.sender,
            debt: 0,
            status: Types.VaultStatus.Active,
            createdAt: block.timestamp
        });

        ownerVaults[msg.sender].push(vaultId);
        propertyToVault[propertyId] = vaultId;

        emit VaultOpened(vaultId, msg.sender, propertyId);
    }


    /// @notice Minta RESD dal vault
    /// @param amount Quantità di RESD da mintare (18 decimali)
    function mint (uint vaultId, uint256 amount) external nonReentrant {
        if (amount == 0 ) revert ZeroAmount();

        Types.Vault storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (vault.owner != msg.sender) revert NotVaultOwner();
        if (vault.status != Types.VaultStatus.Active) revert VaultNotActive();

        uint256 newDebt = vault.debt + amount;
        if (newDebt < MIN_DEBT) revert BelowMinDebt();

        // Calcola valore proprietà
        uint256 propertyValue = _getPropertyValue(vault.PropertyId);

        // Verifica Collateral ratio : value /debt >= 150%
        // Equilvalente: value + 10000 >= debt * 15000
        if (propertyValue * 10000 < newDebt * COLLATERAL_RATIO){
            revert BelowCollateralRatio();
        }

        vault.debt = newDebt;
        resd.mint(msg.sender, amount);

        emit Minted(vaultId, msg.sender, amount);
    }


    /// @notice Brucia Resd per ridurre il debito
    /// @param vaultId ID del vault
    /// @param amount Quantità di RESD da bruciare
    function burn(uint256 vaultId, uint256 amount) external nonReentrant {
        if (amount == 0 ) revert ZeroAmount();

        Types.Vault storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (vault.owner != msg.sender) revert NotVaultOwner();
        if (vault.status != Types.VaultStatus.Active) revert VaultNotActive();
        if (amount > vault.debt) revert InsufficientDebt();

        vault.debt -= amount;
        resd.burn(msg.sender, amount);

        //Se debt = 0, chiudi il vault
        if (vault.debt == 0) {
            vault.status = Types.VaultStatus.Closed;
            propertyToVault[vault.PropertyId] = 0;
            emit VaultClosed(vaultId);
        }

        emit Burned(vaultId, msg.sender, amount);
    } 

    // ============== Recall Mechanism =======================

    // @notice Avvia il recall: l'owner deposita USDC per riacquistare tutti i RESD
    // @param vaultId ID del vault
    function initiateRecall(uint256 vaultId) external nonReentrant {
        Types.Vault storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (vault.owner != msg.sender) revert NotVaultOwner();
        if (vault.status != Types.VaultStatus.Active) revert VaultNotActive();
        if (vault.debt == 0) revert InsufficientDebt();

        // Calcola USDC necessari: debt + 2% premium
        uint256 totalUSDC = _calculateRecallUSDC(vault.debt);

        // Trasferisci USDC dall'owner al contratto
        usdc.safeTransferFrom(msg.sender, address(this), totalUSDC);

        // Aggiorna stato 
        vault.status = Types.VaultStatus.InRecall;
        recalls[vaultId] = Types.RecallRequest({
            vaultId: vaultId,
            totalUSDC: totalUSDC,
            redeemedUSDC: 0,
            redeemedRESD: 0,
            startedAt: block.timestamp,
            deadline: block.timestamp + RECALL_PERIOD
        });

        emit RecallInitiated(vaultId, totalUSDC, block.timestamp + RECALL_PERIOD);
    }

    /// @notice Holder scambia RESD perd USDC durante il recall
    /// @param vaultId ID del vault in recall
    /// @param resdAmount Quantità di RESD da redimere
    function redeemForStable(uint256 vaultId, uint256 resdAmount) external nonReentrant {
        if (resdAmount == 0) revert ZeroAmount();
        
        Types.Vault storage vault = vaults[vaultId];
        if(vault.status !=  Types.VaultStatus.InRecall) revert RecallNotActive();

        Types.RecallRequest storage recall = recalls[vaultId];

        /// Calcola USDC da ricevere (con premium)
        uint256 rate = getRedeemedRate(vaultId);
        uint256 usdcAmount = (resdAmount * rate) / 1e30;

        // Verifica che ci siano abbastanza USDC
        uint256 availableUSDC = recall.totalUSDC - recall.redeemedUSDC;
        if (usdcAmount > availableUSDC) revert InsufficientUSDC();

        // Aggiorna lo stato
        recall.redeemedUSDC += usdcAmount;
        recall.redeemedRESD += resdAmount;
        vault.debt -= resdAmount;

        // Brucia RESD dell'holder
        resd.burn(msg.sender, resdAmount);

        // Trasferisci USDC all'holder
        usdc.safeTransfer(msg.sender, usdcAmount);
        
        emit Redeemed(vaultId, msg.sender, resdAmount, usdcAmount);

        // Se tutto il debt è stato riscattato, chiudi automaticamente
        if(vault.debt == 0) {
            _finalizeRecallInternal(vaultId);
        }
    }

    /// @notice Finalizza il recal dopo la deadline (solo owner)
    /// @param vaultId ID del vault
    function finalizeRecall(uint256 vaultId) external nonReentrant  {
        Types.Vault storage vault = vaults[vaultId];
        if (vault.owner != msg.sender) revert NotVaultOwner();
        if (vault.status != Types.VaultStatus.InRecall) revert RecallNotActive();

        Types.RecallRequest storage recall = recalls[vaultId];
        if (block.timestamp < recall.deadline) revert RecallNotExpired();

        _finalizeRecallInternal(vaultId);
    }

    /// @notice [ADMIN/DEMO] Forza la chiusura del recall senza aspettare la deadline
    /// @param vaultId ID del vault
    function forceCloseRecall(uint256 vaultId) external onlyOwner nonReentrant {
        Types.Vault storage vault = vaults[vaultId];
        if (vault.status != Types.VaultStatus.InRecall) revert RecallNotActive();

        _finalizeRecallInternal(vaultId);
    } 

    /// @notice Logica interna di finalizzazione recall
    function _finalizeRecallInternal(uint256 vaultId) internal {
        Types.Vault storage vault = vaults[vaultId];
        Types.RecallRequest storage recall = recalls[vaultId];

        // Calcola USDC non riscossi
        uint256 unclaimedUSDC = recall.totalUSDC - recall.redeemedUSDC;

        // Restituiti USDC non riscossi dall'owner 
        if (unclaimedUSDC > 0) {
            usdc.safeTransfer(vault.owner, unclaimedUSDC);
        }

        // Chiudi Vault
        vault.status = Types.VaultStatus.Closed;
        vault.debt = 0;
        propertyToVault[vault.PropertyId] = 0;

        emit RecallFinalized(vaultId, unclaimedUSDC);
        emit VaultClosed(vaultId);
    }

    // =============== View Functions =============================

    /// @notice Calcola il rate di redeem corrente (1 RESD = X USDC, in 18 decimali)
    /// @dev Settimana 1 : 1.02 ,   Settimana 2-3: 1.01, Settimana 4: 1.00
    function getRedeemedRate(uint256 vaultId) public view returns (uint256){
        Types.RecallRequest memory recall = recalls[vaultId];
        if (recall.startedAt == 0 ) return 0;

        uint256 elapsed = block.timestamp - recall.startedAt;

        if (elapsed <= 7 days) {
            // Settimana 1 : +2%
            return 1.02e18;
        } else if(elapsed <= 21 days){
            // Settimana 2-3: +1%
            return 1.01e18;
        } else {
            // Settimana 4: pari
            return 1e18;
        }
    }

    /// @notice Restituisce il collateral ratio corrente di un vault (in bps)
    function getCollateralRatio(uint256 vaultId) external view returns (uint256) {
        Types.Vault memory vault = vaults[vaultId];
        if (vault.debt == 0) return type(uint256).max;

        uint256 propertyValue = _getPropertyValue(vault.PropertyId);
        return (propertyValue * 10000)/ vault.debt;
    }

    /// @notice Calcola quanto RESD puo ancora mintare un vault
    function getAvailableToMint(uint256 vaultId) external view returns (uint256) {

        Types.Vault memory vault = vaults[vaultId];
        if (vault.status != Types.VaultStatus.Active) return 0;

        uint256 propertyValue = _getPropertyValue(vault.PropertyId);
        uint256 maxDebt = (propertyValue * 10000) / COLLATERAL_RATIO;

        if (maxDebt <= vault.debt) return 0;
        return maxDebt - vault.debt;        
    }

    /// @notice Verifica se un vault è healthy (ratio >= liquidation ratio)
    function isHealthy(uint256 vaultId) external view returns (bool){
        Types.Vault memory vault = vaults[vaultId];
        if (vault.debt == 0 ) return true;

        uint256 propertyValue = _getPropertyValue(vault.PropertyId);
        return (propertyValue * 10000) >= (vault.debt * LIQUIDATION_RATIO);
    }

    /// @notice Restituirsce tutti i vaultId di un owner
    function getOwnerVaultIds(address owner) external view returns (uint256[] memory) {
        return ownerVaults[owner];
    }

    /// @notice Restituisce i dari completi di un vault
    function getVault(uint256 vaultId) external view returns (Types.Vault memory){
        return vaults[vaultId];
    }

    /// @notice Restituisce i dati del recall
    function getRecall(uint vaultId) external view returns (Types.RecallRequest memory) {
        return recalls[vaultId];
    }

    // ======================== Internal =============================

    /// @notice Calcola il valore della proprietà dal PriceOracle
    function _getPropertyValue(uint256 propertyId) internal view returns (uint){
        Types.Property memory prop = registry.getProperty(propertyId);
        // per MVP: assumiamo 100 mq come default
        //TODO: aggiungere sqm alla struct Property quando disponibile da TLS notary
        uint256 sqm = 100;

        return oracle.getPropertyValue(prop.provincia, prop.comune, prop.categoria, sqm);
    }

    /// @notice Calcola USDC necessari per il recall  (debt + 2% premium)
    function _calculateRecallUSDC(uint256 debt) internal pure returns (uint256){
        // debt è in 18 decimali (RESD)
        // USDC ha 6 decimali, quindi convertiamo
        // debt + 2% = debt * 102 / 100
        uint256 totalWithPremium = (debt * 102) / 100;
        // Converti da 18 decimali
        return totalWithPremium / 1e12;
    }
}



