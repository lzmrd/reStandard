// Re-export sepolia per compatibilità con i file esistenti
import { sepolia } from "viem/chains";

export const targetChain = sepolia;

// Alias per retrocompatibilità (da rimuovere in futuro)
export const arcTestnet = sepolia;
