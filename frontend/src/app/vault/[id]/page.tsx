// frontend/src/app/vault/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { HealthIndicator } from "@/components/HealthIndicator";
import { MintBurnForm } from "@/components/MintBurnForm";
import { 
  useVault, 
  useProperty, 
  useResdBalance, 
  useInitiateRecall, 
  useApproveUsdc,
  formatEther 
} from "@/hooks/useContracts";
import { formatUnits } from "viem";
import { AddressDisplay } from "@/components/AddressDisplay";
import { useDemo } from "@/contexts/DemoContext";

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = BigInt(params.id as string);
  const { address } = useAccount();

  // Recall initiation
  const { initiateRecall, isPending: recallPending, isSuccess: recallSuccess } = useInitiateRecall();
  const { approve: approveUsdc, isPending: approvePending, isSuccess: approveSuccess } = useApproveUsdc();
  const [recallStep, setRecallStep] = useState<'idle' | 'approving' | 'initiating'>('idle');
  const { markVaultClosed, isVaultClosedDemo } = useDemo();

  const { data: vault, isLoading: vaultLoading } = useVault(vaultId);
  const propertyId = vault ? vault.PropertyId : BigInt(0);
  const { data: property, isLoading: propertyLoading } = useProperty(propertyId);
  const { data: resdBalance } = useResdBalance(address);

  const isLoading = vaultLoading || propertyLoading;

  // Derived values (only when vault is loaded)
  const owner = vault?.owner ?? "0x0000000000000000000000000000000000000000";
  const debt = vault?.debt ?? BigInt(0);
  const status = isVaultClosedDemo(vaultId) ? 2 : (vault?.status ?? 0);
  const createdAt = vault?.createdAt ?? BigInt(0);

  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const debtFormatted = formatUnits(debt, 18);

  // Calculate required USDC for recall: debt + 2%, converted to 6 decimals
  const requiredUsdc = debt > BigInt(0) 
    ? ((debt * BigInt(102)) / BigInt(100)) / BigInt(1e12)
    : BigInt(0);

  const handleInitiateRecall = async () => {
    if (requiredUsdc === BigInt(0)) return;
    setRecallStep('approving');
    approveUsdc(requiredUsdc);
  };

  // Effect to continue recall after approval
  useEffect(() => {
    if (approveSuccess && recallStep === 'approving') {
      setRecallStep('initiating');
      initiateRecall(vaultId);
    }
  }, [approveSuccess, recallStep, vaultId, initiateRecall]);

  useEffect(() => {
    if (recallSuccess) {
      setRecallStep('idle');
    }
  }, [recallSuccess]);

  const statusLabels = ["Active", "In Recall", "Closed"];
  const statusColors = [
    "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    "bg-white/10 text-white/50 border border-white/20"
  ];
  const mockRatio = debt > BigInt(0) ? 18500 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div>
            <div className="h-8 shimmer rounded w-1/3 mb-4" />
            <div className="h-64 shimmer rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!vault || vault.owner === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-8 text-center">
            <h1 className="text-2xl font-bold mb-2 text-white">Vault Not Found</h1>
            <p className="text-white/60">Vault #{String(params.id)} does not exist.</p>
            <a href="/dashboard" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block transition-colors">
              Back to Dashboard
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/dashboard" className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <h1 className="text-3xl font-bold text-white">Vault #{String(params.id)}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vault Stats */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Vault Statistics</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50">Total Debt</p>
                  <p className="text-2xl font-bold text-white">{Number(debtFormatted).toLocaleString()} RESD</p>
                </div>

                <div>
                  <p className="text-sm text-white/50">Collateral Ratio</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">{(mockRatio / 100).toFixed(1)}%</p>
                    <HealthIndicator ratio={mockRatio} />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white/50">Property ID</p>
                  <p className="text-lg font-medium text-white">#{propertyId.toString()}</p>
                </div>

                <div>
                  <p className="text-sm text-white/50">Created on</p>
                  <p className="text-lg font-medium text-white">
                    {new Date(Number(createdAt) * 1000).toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>
            </div>

            {/* Property Info */}
            {property && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Collateral Property</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/50">Location</p>
                    <p className="font-medium text-white">{property.comune} ({property.provincia})</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/50">Category</p>
                    <p className="font-medium text-white">{property.categoria}</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/50">Cadastral Identifiers</p>
                    <p className="font-medium text-white">
                      Sheet {property.foglio}, Parcel {property.particella}, Sub. {property.subalterno || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/50">Estimated Value</p>
                    <p className="font-medium text-green-600">~€170,000</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recall Info (quando in recall) */}
            {status === 1 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-orange-400 mb-4">Recall in Progress</h2>
                <p className="text-orange-300/80 mb-4">
                  The vault is in recall phase. RESD holders can redeem their tokens for USDC.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.05] rounded-lg p-3 border border-white/[0.08]">
                    <p className="text-xs text-white/50">Week 1</p>
                    <p className="font-bold text-green-400">1.02 USDC/RESD</p>
                  </div>
                  <div className="bg-white/[0.05] rounded-lg p-3 border border-white/[0.08]">
                    <p className="text-xs text-white/50">Week 2-3</p>
                    <p className="font-bold text-orange-400">1.01 USDC/RESD</p>
                  </div>
                  <div className="bg-white/[0.05] rounded-lg p-3 border border-white/[0.08]">
                    <p className="text-xs text-white/50">Week 4</p>
                    <p className="font-bold text-white/60">1.00 USDC/RESD</p>
                  </div>
                </div>

                {/* Demo Mode Button */}
                {isOwner && (
                  <div className="mt-6 pt-4 border-t border-orange-500/20">
                    <p className="text-xs text-orange-400/60 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Demo Mode Only
                    </p>
                    <button
                      onClick={() => markVaultClosed(vaultId)}
                      className="w-full py-2 bg-white/[0.05] border border-white/[0.1] text-white/70 rounded-lg text-sm font-medium hover:bg-white/[0.1] hover:text-white transition-all duration-300"
                    >
                      Force Close Recall 
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Mint/Burn Form (solo owner e vault attivo) */}
            {isOwner && status === 0 && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Manage RESD</h2>
                <MintBurnForm vaultId={vaultId} currentDebt={debt} />
              </div>
            )}

            {/* Recall Button (solo owner e vault attivo con debt > 0) */}
            {isOwner && status === 0 && debt > BigInt(0) && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Recall</h2>
                <p className="text-sm text-white/60 mb-4">
                  Initiate recall to buy back all RESD in circulation.
                </p>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 mb-4">
                  <p className="text-xs text-white/50">Required USDC (debt + 2%)</p>
                  <p className="font-bold text-lg text-white">{Number(formatUnits(requiredUsdc, 6)).toLocaleString()} USDC</p>
                </div>
                <button
                  onClick={handleInitiateRecall}
                  disabled={recallPending || approvePending || recallStep !== 'idle'}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {recallStep === 'approving' ? (
                    "Approving USDC..."
                  ) : recallStep === 'initiating' ? (
                    "Initiating Recall..."
                  ) : (
                    "Initiate Recall"
                  )}
                </button>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Owner</h2>
              <AddressDisplay
                address={owner}
                showAvatar
                linkToEtherscan
              />
              {isOwner && (
                <span className="inline-block mt-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs rounded-full">
                  You are the owner
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
