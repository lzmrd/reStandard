// SPDX-Liense-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Types } from "./libraries/Types.sol";

/// @title PropertyRegistry
/// @notice Registro on-chain di proprietà immobiliari verificate via TLS Notary

contract PropertyRegistry is Ownable {
    /// @notice Contatore incrementale per property ID
    uint256 public nextPropertyId;

    /// @notice propertyId => Property
    mapping(uint256 => Types.Property) public properties;

    /// @notice owner => lista di propertyId
    mapping(address => uint256[]) public ownerProperties;

    /// @notice proofHash => bool (evita registrazioni duplicate)
    mapping(bytes32 => bool) public userProofs;

    /// @notice Indirizzo autorizzato a verificare le proof (backend verifier)
    address public verifier;

    error PropertyNotFound();
    error ProofAlreadyUsed();
    error OnlyVerifier();
    error ZeroAddress();
    error NotPropertyOwner();

    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed owner,
        string comune,
        string provincia,
        bytes32 proofHash
    );
    event PropertyVerified(uint256 indexed propertyId);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    modifier onlyVerifier() {
        if (msg.sender != verifier) revert OnlyVerifier();
        _;
    }

    constructor() Ownable(msg.sender) {}

    ///@notice Imposta l'indirizzo del backend verifier
    function setVerifier (address _verifier) external onlyOwner {
        if (_verifier == address(0)) revert ZeroAddress();
        address old = verifier;
        verifier = _verifier;
        emit VerifierUpdated(old, _verifier);
    }

    /// @notice Registra una proprietà con la proof TLS notary
    /// @dev L'utente chiama questa funzione dopo aver generato la proof
    ///      La proprietà viene registrata come non-verificata (verified = false)
    ///      Il verifier backend la verifica in un secondo momento
    function registerProperty(
        string calldata foglio,
        string calldata particella,
        string calldata subalterno,
        string calldata categoria,
        string calldata comune,
        string calldata provincia,
        bytes32 proofHash
    ) external returns (uint256 propertyId){
        if (userProofs[proofHash]) revert ProofAlreadyUsed();

        propertyId = nextPropertyId++;
        userProofs[proofHash] = true;

        properties[propertyId] = Types.Property({
            owner: msg.sender,
            foglio: foglio,
            particella: particella,
            subalterno: subalterno,
            categoria: categoria,
            comune: comune,
            provincia: provincia,
            proofHash: proofHash,
            registeredAt: block.timestamp,
            verified: false
        });

        ownerProperties[msg.sender].push(propertyId);

        emit PropertyRegistered(propertyId, msg.sender, comune, provincia, proofHash);
    }

    /// @notice Il verifier comferma che la TLS Notary proof è valida
    /// @dev Chiamata dal backend dopo la verifica off-chain della proof
    function verifyProperty(uint256 propertyId) external onlyVerifier {
        Types.Property storage prop = properties[propertyId];
        if (prop.owner == address(0)) revert PropertyNotFound();
        prop.verified = true;
        emit PropertyVerified(propertyId);
    }

    ///@notice Restituisce i dati di una proprietà
    function getProperty(uint256 propertyId) external view returns (Types.Property memory){
        Types.Property memory prop = properties[propertyId];
        if (prop.owner == address(0)) revert PropertyNotFound();
        return prop;
    }

    /// @notice Restituisce tutti i propertyId di un owner
    function getOwnerPropertyIds(address owner) external view returns (uint256[] memory){
        return ownerProperties[owner];
    }

    /// @notice Numero totale di proprietà registrate
    function totalProperties() external view returns (uint256){
        return nextPropertyId;
    }

 
 }
