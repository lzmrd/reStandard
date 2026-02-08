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
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("mint")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === "mint"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1] border border-white/[0.08]"
          }`}
        >
          Mint RESD
        </button>
        <button
          onClick={() => setMode("burn")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === "burn"
              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1] border border-white/[0.08]"
          }`}
        >
          Burn RESD
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-1">
            Amount (RESD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 pr-16 text-white placeholder-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={setMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              MAX
            </button>
          </div>
          <p className="mt-1.5 text-xs text-white/50">
            {mode === "mint"
              ? `Available to mint: ${Number(maxMint).toLocaleString()} RESD`
              : `Current debt: ${Number(maxBurn).toLocaleString()} RESD`}
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || !amount}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            mode === "mint"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
              : "bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:-translate-y-0.5"
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
        <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30">
          <p className="text-sm text-green-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Transaction successful!
          </p>
        </div>
      )}
    </div>
  );
}
