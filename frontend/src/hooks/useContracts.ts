"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt   } from "wagmi";
import { parseEther, formatEther, keccak256, toBytes } from "viem";
import { ADDRESSES } from "@/abi/addresses";
import { arcTestnet } from "@/lib/chains";
// ABI minimali — solo le funzioni che usiamo
const PropertyRegistryABI = [
  {
    name: "registerProperty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "foglio", type: "string" },
      { name: "particella", type: "string" },
      { name: "subalterno", type: "string" },
      { name: "categoria", type: "string" },
      { name: "comune", type: "string" },
      { name: "provincia", type: "string" },
      { name: "proofHash", type: "bytes32" },
    ],
    outputs: [{ name: "propertyId", type: "uint256" }],
  },
  {
    name: "getProperty",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "foglio", type: "string" },
          { name: "particella", type: "string" },
          { name: "subalterno", type: "string" },
          { name: "categoria", type: "string" },
          { name: "comune", type: "string" },
          { name: "provincia", type: "string" },
          { name: "proofHash", type: "bytes32" },
          { name: "registeredAt", type: "uint256" },
          { name: "verified", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getOwnerPropertyIds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
] as const;

const VaultManagerABI = [
  {
    name: "openVault",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [{ name: "vaultId", type: "uint256" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "burn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "initiateRecall",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "redeemForStable",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "vaultId", type: "uint256" },
      { name: "resdAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getVault",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "PropertyId", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "debt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getOwnerVaultIds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getAvailableToMint",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getCollateralRatio",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isHealthy",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getRedeemedRate",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getRecall",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "vaultId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "vaultId", type: "uint256" },
          { name: "totalUSDC", type: "uint256" },
          { name: "redeemedUSDC", type: "uint256" },
          { name: "redeemedRESD", type: "uint256" },
          { name: "startedAt", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
    ],
  },
] as const;

const ERC20ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// ============ Property Registry Hooks ============

export function useRegisterProperty() {
    const { writeContract, data : hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming,isSuccess } = useWaitForTransactionReceipt({ hash });

    const register = (
        foglio: string,
        particella: string,
        subalterno: string,
        categoria: string,
        comune: string,
        provincia: string,
        walletAddress: string
    ) => {
        // Generate deterministic proof hash (mock TLS Notary)
        const proofData = `${foglio} - ${particella} - ${subalterno} - ${walletAddress} - ${Date.now()} `;
        const proofHash = keccak256(toBytes(proofData));

        writeContract({
            address: ADDRESSES.arcTestnet.propertyRegistry,
            abi: PropertyRegistryABI,
            functionName: "registerProperty",
            args: [foglio, particella, subalterno, categoria, comune, provincia, proofHash],
        });
    };
    return {register, hash, isPending, isConfirming, isSuccess, error };
}

export function useProperty(propertyId: bigint | undefined) {
    return useReadContract({
        address: ADDRESSES.arcTestnet.propertyRegistry,
        abi: PropertyRegistryABI,
        functionName: "getProperty",
        args: propertyId ? [propertyId] : undefined,
        chainId: arcTestnet.id,
        query: {enabled: !!propertyId },
    });
}

export function useOwnerProperties(owner: `0x${string}` | undefined){
    return useReadContract({
        address: ADDRESSES.arcTestnet.propertyRegistry,
        abi: PropertyRegistryABI,
        functionName: "getOwnerPropertyIds",
        args: owner ? [owner] : undefined,
        chainId: arcTestnet.id,
        query: {enabled: !!owner },
    });
}

// ============ Vault Manager Hooks ============

export function useOpenVault() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const openVault = (propertyId: bigint ) => {
        writeContract({
            address: ADDRESSES.arcTestnet.vaultManager,
            abi: VaultManagerABI,
            functionName: "openVault",
            args: [propertyId] ,
        });
    };
    return { openVault, hash, isPending, error };
}

export function useMint() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const mint = (vaultId: bigint, amount: string) =>{
      writeContract({
      address: ADDRESSES.arcTestnet.vaultManager,
      abi: VaultManagerABI,
      functionName: "mint",
      args: [vaultId, parseEther(amount)],
    });
    };
    return { mint, hash, isPending, isConfirming, isSuccess, error };
}

export function useBurn() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess} = useWaitForTransactionReceipt({ hash });

    const burn = (vaultId: bigint, amount: string) => {
        writeContract({
        address: ADDRESSES.arcTestnet.vaultManager,
        abi: VaultManagerABI,
        functionName: "burn",
        args: [vaultId, parseEther(amount)],
        });
    };

    return { burn, hash, isPending, isConfirming, isSuccess, error };

}


export function useVault(vaultId: bigint | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.vaultManager,
    abi: VaultManagerABI,
    functionName: "getVault",
    args: vaultId ? [vaultId] : undefined,
    query: { enabled: !!vaultId },
  });
}

export function useOwnerVaults(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.vaultManager,
    abi: VaultManagerABI,
    functionName: "getOwnerVaultIds",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  });
}

export function useAvailableToMint(vaultId: bigint | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.vaultManager,
    abi: VaultManagerABI,
    functionName: "getAvailableToMint",
    args: vaultId ? [vaultId] : undefined,
    query: { enabled: !!vaultId },
  });
}

export function useCollateralRatio(vaultId: bigint | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.vaultManager,
    abi: VaultManagerABI,
    functionName: "getCollateralRatio",
    args: vaultId ? [vaultId] : undefined,
    query: { enabled: !!vaultId },
  });
}

export function useIsHealthy(vaultId: bigint | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.vaultManager,
    abi: VaultManagerABI,
    functionName: "isHealthy",
    args: vaultId ? [vaultId] : undefined,
    query: { enabled: !!vaultId },
  });
}

// ============ RESD Token Hooks ============

export function useResdBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.resd,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ============ USDC Hooks ============

export function useUsdcBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: ADDRESSES.arcTestnet.usdc,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useApproveUsdc() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: bigint) => {
    writeContract({
      address: ADDRESSES.arcTestnet.usdc,
      abi: ERC20ABI,
      functionName: "approve",
      args: [ADDRESSES.arcTestnet.vaultManager, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ============ Utility ============

export { formatEther, parseEther };

export function usePropertyValue(
  provincia: string | undefined,
  comune: string | undefined,
  categoria: string | undefined,
  sqm: number = 100
) {
  const PriceOracleABI = [
    {
name: "getPropertyValue",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "provincia", type: "string" },
        { name: "comune", type: "string" },
        { name: "categoria", type: "string" },
        { name: "sqm", type: "uint256" },
      ],
      outputs: [{ name: "", type: "uint256" }],
    },
  ] as const;

  return useReadContract({
    address: ADDRESSES.arcTestnet.priceOracle,
    abi: PriceOracleABI,
    functionName: "getPropertyValue",
    args: provincia && comune && categoria
    ? [provincia, comune, categoria, BigInt(sqm)]
    : undefined,
    query: { enabled: !!(provincia && comune && categoria)},
  });
}