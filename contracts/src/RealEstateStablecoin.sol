// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RealEstateStablecoin (RESD)
/// @notice ERC-20 stabelcoin backed by real estate
/// @dev Solo il VaultManager (minter) può mintare e bruciare

contract RealEstateStablecoin is ERC20, Ownable {
   /// @notice Indirizzo autorizzato a mint/burn (VaultManager)
   address public minter;
   
   error OnlyMinter();
   error ZeroAddress();

   event MinterUpdated(address indexed oldMinter, address indexed newMinter);

   modifier onlyMinter() {
    if (msg.sender != minter) revert OnlyMinter();
    _;
   }

   constructor() ERC20("Real Estate Standard Dollar", "RESD") Ownable(msg.sender) {}

   /// @notice Imposta l'indirizzo del VaultManager come unico minter
   /// @dev Chiamabile solo dall'owner (deployer). Si chiama una volta dopo il deploy
   function setMinter(address _minter) external onlyOwner {
    if (_minter == address(0))revert ZeroAddress();
    address old = minter;
    minter = _minter;
    emit MinterUpdated(old, _minter);
   }

   /// @notice Crea nuovi RESD. Solo il VaultManager può chiamarla
   function mint(address to, uint256 amount) external onlyMinter {
    _mint(to, amount);
   }

   /// @notice Brucia RESD. Solo per il VaultManager può chiamarla
   function burn(address from, uint256 amount) external onlyMinter {
    _burn(from, amount);
   }
}
