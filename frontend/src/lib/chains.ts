import { defineChain } from "viem";

// Per ora usiamo Base Sepolia come fallback (Circle Arc non pubblico)
// Aggiornare con RPC Arc quando disponibile
export const arcTestnet = defineChain({
  id: 84532, // Base Sepolia
  name: "Base Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://sepolia.basescan.org",
    },
  },
  testnet: true,
});
