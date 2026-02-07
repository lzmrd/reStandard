"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useApproveGateway, useDepositToGateway, fetchGatewayBalance } from "@/hooks/useCircleGateway";
import { useUsdcBalance } from "@/hooks/useContracts";
import { formatUnits } from "viem";

export function CircleGateway() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [gatewayBalance, setGatewayBalance] = useState("0");
  const [step, setStep] = useState<"approve" | "deposit">("approve");

  const { data: usdcBalance } = useUsdcBalance(address);
  const { approve, isPending: approvePending, isSuccess: approveSuccess } = useApproveGateway();
  const { deposit, isPending: depositPending, isSuccess: depositSuccess } = useDepositToGateway();

  // Fetch Gateway balance
  useEffect(() => {
    if (address) {
      fetchGatewayBalance(address).then(setGatewayBalance);
    }
  }, [address, depositSuccess]);

  // Move to deposit step after approval
  useEffect(() => {
    if (approveSuccess) {
      setStep("deposit");
    }
  }, [approveSuccess]);

  const handleApprove = () => {
    if (amount) approve(amount);
  };

  const handleDeposit = () => {
    if (amount) deposit(amount);
  };

  const formattedUsdcBalance = usdcBalance 
    ? formatUnits(usdcBalance, 6) 
    : "0";

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">C</span>
        </div>
        <h2 className="text-lg font-semibold">Circle Gateway</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Deposita USDC nel Gateway per trasferimenti crosschain istantanei.
      </p>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Wallet USDC</p>
          <p className="font-bold">{Number(formattedUsdcBalance).toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600">Gateway Balance</p>
          <p className="font-bold text-blue-700">{Number(gatewayBalance).toFixed(2)}</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Importo USDC
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      {step === "approve" ? (
        <button
          onClick={handleApprove}
          disabled={!amount || approvePending}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {approvePending ? "Approving..." : "1. Approve USDC"}
        </button>
      ) : (
        <button
          onClick={handleDeposit}
          disabled={!amount || depositPending}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
        >
          {depositPending ? "Depositing..." : "2. Deposit to Gateway"}
        </button>
      )}

      {depositSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ Deposito completato! I tuoi USDC sono ora disponibili su tutte le chain.
          </p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-400 mt-4">
        Powered by Circle Gateway • Trasferimenti &lt;500ms
      </p>
    </div>
  );
}
