"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { ADDRESSES } from "@/abi/addresses";

//ABI minimali per Gateway
const GatewayWalletABI = [
    {
        name: "deposit",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name : "token", type: "address"},
            { name : "amount", type: "uint256"},
        ],
        outputs: [],

    },
] as const;

const ERC20ABI = [
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
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Hook per approvare USDC al Gateway Wallet
 */
export function useApproveGateway() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: string) => {
    const amountInUnits = parseUnits(amount, 6); // USDC ha 6 decimali
    writeContract({
      address: ADDRESSES.arcTestnet.usdc,
      abi: ERC20ABI,
      functionName: "approve",
      args: [ADDRESSES.circleGateway.wallet, amountInUnits],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Hook per depositare USDC nel Gateway
 */
export function useDepositToGateway() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amount: string) => {
    const amountInUnits = parseUnits(amount, 6);
    writeContract({
      address: ADDRESSES.circleGateway.wallet,
      abi: GatewayWalletABI,
      functionName: "deposit",
      args: [ADDRESSES.arcTestnet.usdc, amountInUnits],
    });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Fetch saldo unificato dal Gateway API
 */
export async function fetchGatewayBalance(depositor: string): Promise<string> {
  try {
    const response = await fetch(`${ADDRESSES.circleGateway.apiTestnet}/balances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "USDC",
        sources: [
          { domain: 6, depositor },  // Base Sepolia
          { domain: 26, depositor }, // Arc Testnet
        ],
      }),
    });
    
    const data = await response.json();
    return data.balance || "0";
  } catch (error) {
    console.error("Error fetching Gateway balance:", error);
    return "0";
  }
}
