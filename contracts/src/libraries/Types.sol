// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
    /// @notice Stato di un vault
    enum VaultStatus {
        Active,     // Vault operativo, può mintare/burnare
        InRecall,   // Recall avviato, in attesa che holders riscuotano
        Closed      // Vault chiuso, debt = 0
    }

    /// @notice Proprietà immobiliare registrata on-chain
    struct Property {
        address owner;             // Wallet del proprietario
        string foglio;             // Identificativo catastale: foglio 
        string particella;         // Identificativo catastale: particella 
        string subalterno;         // Identificativo catastale: subalterno
        string categoria;          // Categoria catastale: (es. "A/7")
        string comune;             // Comune (es. "ROMA")
        string provincia;          // Provincia (es. "RM")
        bytes32 proofHash;         // Hash della TLS Notary proof
        uint256 registeredAt;      // Timestamp registrazione
        bool verified;             // Se la proof è verificata
    }

    /// @notice Vault: posizione di debito collateralizzata da un immobile
    struct Vault {
        uint256 PropertyId;     // ID della proprietà collaterale
        address owner;          // Proprietario della Vault
        uint256 debt;           // Debt in Resd (18 decimali)
        VaultStatus status;     // Active, InRecall, Closed
        uint256 createdAt;      // Timestamp creazione
    }

    /// @notice Dati di prezzo per una zona/categoria 
    struct PriceData {
        uint256 pricePerSqm;   // Prezzo al mq in usd (18 decimali)
        uint256 updatedAt;     // Timestamp ultimo aggiornamento
        string source;         // Fonte del dato ("OMI", "Openapi")
    }

    /// @notice Richiesta di recalll da parte dell'owner
    struct RecallRequest {
        uint256 vaultId;            // Vault da richiamare
        uint256 totalUSDC;          // USDC totali depositati dall'owner
        uint256 redeemedUSDC;       // USDC già riscossi dagli holders 
        uint256 redeemedRESD;       // RESD bruciati durante il recall 
        uint256 startedAt;          // Timestamp avvio recall
        uint256 deadline;           // Timestamp scadenza (startedAt + 30 giorni)
    }
}