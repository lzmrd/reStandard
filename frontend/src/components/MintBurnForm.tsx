"use client";

import { useState } from "react";
import { useMint, useBurn, useAvailableToMint, formatEther } from "@/hooks/useContracts";

interface MintBurnFormProps {
  vaultId: bigint;
  currentDebt: bigint;
}

export function MintBurnForm({ vaultId, currentDebt }: MintBurnFormProps) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"mint" | "burn">("mint");

  const { mint, isPending: mintPending, isSuccess: mintSuccess } = useMint();
  const { burn, isPending: burnPending, isSuccess: burnSuccess } = useBurn();
  const { data: availableToMint } = useAvailableToMint(vaultId);

  const isPending = mintPending || burnPending;
  const maxMint = availableToMint ? formatEther(availableToMint) : "0";
  const maxBurn = formatEther(currentDebt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isPending) return;

    if (mode === "mint") {
      mint(vaultId, amount);
    } else {
      burn(vaultId, amount);
    }
  };

  const setMax = () => {
    setAmount(mode === "mint" ? maxMint : maxBurn);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("mint")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            mode === "mint"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mint RESD
        </button>
        <button
          onClick={() => setMode("burn")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            mode === "burn"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Burn RESD
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (RESD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-16 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={setMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              MAX
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {mode === "mint"
              ? `Available to mint: ${Number(maxMint).toLocaleString()} RESD`
              : `Current debt: ${Number(maxBurn).toLocaleString()} RESD`}
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || !amount}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${
            mode === "mint"
              ? "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
              : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
          }`}
        >
          {isPending
            ? "Processing..."
            : mode === "mint"
            ? "Mint RESD"
            : "Burn RESD"}
        </button>
      </form>

      {(mintSuccess || burnSuccess) && (
        <p className="mt-4 text-sm text-green-600">Transaction successful!</p>
      )}
    </div>
  );
}
