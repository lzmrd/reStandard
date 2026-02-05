//SDPX-LicenseIdentidfier: MIT 
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Types } from "./libraries/Types.sol";

/// @title PriceOracle
/// @notice Oracleper prezzo immobiliari italiani (€/mq)
/// @dev MVP: prezzi aggiornati manualmente dall'admin
///      Produzione: Chainlink external adapter + OMI/Openapi.it

contract PriceOracle is Ownable {
    /// @notice Haircut applicato al valore stimato (15% = 8500)
    uint256 public constant HAIRCUT_BPS = 8500; //85% del valore = 15% di sconto
    
    ///@notice Massima età di un prezzo valido (30 giorni) 
    uint256 public constant MAX_STALENESS = 30 days;

    /// @notice Prezzo di default se zona non trovata (1500€/mq, conservativo)
    uint256 public constant DEFAULT_PRICE = 1500 * 1e18;

    /// @notice keccak2556/provincia, comune, categoria) => PriceData
    mapping(bytes32 => Types.PriceData) public prices;

    error PriceStale();
    error InvalidPrice();

    event PriceUpdated(
        string indexed provincia,
        string indexed comune,
        string categoria,
        uint256 pricePerSqm,
        string source
    );

    constructor () Ownable(msg.sender) {}

    /// @notice Aggiorna il prezzo per una zona/categoria 
    /// @param provincia Sigla provincia (es."RM")
    /// @param comune Nome comune (es."ROMA")
    /// @param categoria Categoria catastale (es."A/2")
    /// @param pricePerSqm Prezzo al mq in usd con 18 decimali (es.3000e18 = $3000/mq)
    /// @param source Fonte del dato ("OMI","Openapi")
    function updatePrice(
        string calldata provincia,
        string calldata comune,
        string calldata categoria,
        uint256 pricePerSqm,
        string calldata source
    ) external onlyOwner {
        if (pricePerSqm == 0) revert InvalidPrice();
        bytes32 key = _priceKey(provincia, comune, categoria);
        prices[key] = Types.PriceData({
            pricePerSqm: pricePerSqm,
            updatedAt: block.timestamp,
            source: source
        });

        emit PriceUpdated(provincia,comune, categoria, pricePerSqm, source);
    }

    /// @notice Batch update per caricare più prezzi in una transazione
    function batchUpdatePrices (
        string [] calldata province,
        string [] calldata comuni,
        string [] calldata categorie,
        uint256[] calldata pricesPerSqm,
        string calldata source
    ) external onlyOwner {
        uint256 len = province.length;
        for (uint256 i=0; i < len ; i++){
            if (pricesPerSqm[i] == 0) revert InvalidPrice();

            bytes32 key = _priceKey(province[i], comuni[i], categorie[i]);
            prices[key] = Types.PriceData({
                pricePerSqm: pricesPerSqm[i],
                updatedAt: block.timestamp,
                source: source
            });

            emit PriceUpdated(province[i], comuni[i], categorie[i], pricesPerSqm[i], source);
        }

    }

    /// @notice Calcola il valore di una proprietà (con haircut)
    /// @param provincia Sigla provincia (es."RM")
    /// @param comune Nome comune (es."ROMA")
    /// @param categoria Categoria catastale (es."A/2")
    /// @param sqm Metri quadrati della proprietà
    /// @return value Valore in USd con 18 decimali, già scontato del 15%
    function getPropertyValue(
        string calldata provincia,
        string calldata comune,
        string calldata categoria,
        uint256 sqm
    ) external view returns (uint256 value) {
        bytes32 key = _priceKey(provincia, comune, categoria);
        Types.PriceData memory data = prices[key];

        uint256 pricePerSqm;
        if (data.pricePerSqm == 0) {
            // Zona non trovata, usa il prezzo di default
            pricePerSqm = DEFAULT_PRICE;
        } else {
            // Verifica che il prezzo non sia troppo vecchio
            if (block.timestamp - data.updatedAt > MAX_STALENESS){
                revert PriceStale();
            }
            pricePerSqm = data.pricePerSqm;
        }

        // Valore = prezzo/mq x mp x haircut
        value = (pricePerSqm * sqm * HAIRCUT_BPS) / 10000;
    }

    /// @notice Restituisce il prezzo grezzo (senza haircut) per una zona
    function getRawPrice(
        string calldata provincia,
        string calldata comune,
        string calldata categoria
    ) external view returns (Types.PriceData memory) {
        bytes32 key = _priceKey(provincia, comune, categoria);
        return prices[key];
    }

    /// notice Genera la chiave per il mapping prezzi
    function _priceKey(
        string memory provincia,
        string memory comune,
        string memory categoria
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(provincia, comune, categoria));
    }

}