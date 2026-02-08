# reStandard

**Real Estate-Backed Stablecoin Protocol**

A decentralized protocol that enables Italian property owners to mint **RESD** stablecoins collateralized by verified real estate, featuring a unique pull-based redemption mechanism called **Recall**.

Built for **ETHGlobal HackMoney 2026**.

---

## How It Works

```
Register Property  →  Open Vault  →  Mint RESD  →  Use / Trade
       ↑                                              ↓
  TLS Notary Proof                              Recall (Buyback)
  (Catasto Data)                             RESD → USDC + Premium
```

1. **Register** — A property owner submits catasto data (foglio, particella, subalterno) with a TLS Notary proof from the Italian Land Registry
2. **Open Vault** — Once verified, the property becomes collateral for a CDP (Collateralized Debt Position)
3. **Mint RESD** — The owner mints stablecoins up to 66% of the property's haircut value (150% collateral ratio)
4. **Recall** — When the owner wants to close the vault, they deposit USDC (debt + 2% premium) and RESD holders can redeem tokens for USDC at a premium

---

## The Recall Mechanism

The Recall is a **pull-based redemption** system that incentivizes early participation:

| Period | Redemption Rate | Incentive |
|--------|----------------|-----------|
| Week 1 (days 0-7) | 1 RESD → 1.02 USDC | +2% premium |
| Week 2-3 (days 8-21) | 1 RESD → 1.01 USDC | +1% premium |
| Week 4 (days 22-30) | 1 RESD → 1.00 USDC | At parity |

After 30 days, unclaimed USDC is returned to the vault owner and the vault closes.

---

## Architecture

### Smart Contracts

| Contract | Description |
|----------|-------------|
| `RealEstateStablecoin.sol` | ERC-20 stablecoin token (RESD) with controlled mint/burn |
| `PropertyRegistry.sol` | On-chain registry of verified properties with TLS Notary proofs |
| `PriceOracle.sol` | Real estate price feeds from OMI data, with 15% haircut and staleness checks |
| `VaultManager.sol` | Core CDP engine — vault lifecycle, collateral management, recall logic |
| `Types.sol` | Shared structs and enums |

### Key Parameters

| Parameter | Value |
|-----------|-------|
| Collateral Ratio | 150% |
| Liquidation Ratio | 130% |
| Oracle Haircut | 15% |
| Recall Period | 30 days |
| Recall Premium | 2% (decreasing) |
| Min Vault Debt | 1,000 RESD |

### Frontend

- **Landing** (`/`) — Project overview with feature cards
- **Dashboard** (`/dashboard`) — RESD balance, properties, vaults
- **Register** (`/register`) — 5-step property registration wizard
- **Vault Detail** (`/vault/[id]`) — Manage debt, mint/burn, initiate recall

---

## Tech Stack

**Contracts**
- Solidity 0.8.24
- Foundry (forge, cast, anvil)
- OpenZeppelin Contracts 5.x

**Frontend**
- Next.js 16 + React 19
- TypeScript 5
- Tailwind CSS 4
- Wagmi 3 + Viem 2
- RainbowKit 2
- TanStack React Query 5

**Integrations**
- ENS — Name resolution and avatar display
- Circle — USDC payments for recall mechanism
- TLS Notary — Property ownership verification (MVP: mock proof)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast, anvil)
- A wallet with Sepolia ETH

### Contracts

```bash
cd contracts

# Install dependencies
forge install

# Build
forge build

# Test
forge test

# Deploy to Sepolia
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your RPC URL and contract addresses

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| RESD | `0x710E9965C9f60236188b29C4A9086EAC73540B20` |
| PropertyRegistry | `0x8Ca32A6e75B21f8090c1ea498b5D3CDE9179c169` |
| PriceOracle | `0xAf4d629BA2aBf7A60e0229641C2CD4412Ad46af1` |
| VaultManager | `0x0Ebf4D83b9Aa7B87eEE241200490473721fCDAcf` |
| USDC (Sepolia) | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

---

## Documentation

- [Architecture](./ARCHITECTURE.md) — System design, sequence diagrams, data flows
- [Tokenomics](./TOKENOMICS.md) — RESD economic model, stability mechanisms, risk analysis
- [Progress](./PROGRESS.md) — Hackathon sprint plan and task tracking

---

## Bounty Targets

### Circle Arc #2 — Global Payouts and Treasury Systems

The Recall mechanism implements a treasury-backed payout system:
- Vault owner funds a USDC treasury (debt + premium)
- Multiple RESD holders redeem independently (pull-based distribution)
- Time-decaying premium creates economic incentives for early settlement
- Automatic finalization after 30 days

### ENS Integration

- Wallet display with ENS name resolution and avatar
- ENS name input fields with address resolution
- Bidirectional lookup (address ↔ name)

---

## License

MIT
