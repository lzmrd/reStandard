"use client";

import { useRef } from "react";
import Link from "next/link";
import { useVault, useCollateralRatio, formatEther } from "@/hooks/useContracts";
import { HealthIndicator } from "./HealthIndicator";
import { useDemo } from "@/contexts/DemoContext";

interface VaultCardProps {
  vaultId: bigint;
}

const STATUS_LABELS = ["Active", "In Recall", "Closed"];

export function VaultCard({ vaultId }: VaultCardProps) {
  const { data: vault, isLoading: vaultLoading } = useVault(vaultId);
  const { data: ratio } = useCollateralRatio(vaultId);
  const { isVaultClosedDemo } = useDemo();
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  if (vaultLoading) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
        <div className="h-4 shimmer rounded w-1/2 mb-4"></div>
        <div className="h-4 shimmer rounded w-3/4 mb-3"></div>
        <div className="h-8 shimmer rounded w-1/3"></div>
      </div>
    );
  }

  if (!vault) return null;

  const debt = formatEther(vault.debt);
  const effectiveStatus = isVaultClosedDemo(vaultId) ? 2 : vault.status;
  const status = STATUS_LABELS[effectiveStatus] || "Unknown";

  return (
    <Link href={`/vault/${vaultId.toString()}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="animated-border glow-card rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group inner-glow"
      >
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
              Vault #{vaultId.toString()}
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Property #{vault.PropertyId.toString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              effectiveStatus === 0
                ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : effectiveStatus === 1
                ? "bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-white/10 text-white/50 border-white/20"
            }`}
          >
            {effectiveStatus === 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            )}
            {effectiveStatus === 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            )}
            {status}
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <p className="text-white/50 text-sm">Debt</p>
          <p className="text-2xl font-bold text-white group-hover:gradient-text-static transition-all">
            {Number(debt).toLocaleString()} RESD
          </p>
        </div>

        {ratio !== undefined && effectiveStatus === 0 && (
          <div className="mt-4 relative z-10">
            <HealthIndicator ratio={Number(ratio)} />
          </div>
        )}

        {/* Arrow indicator on hover */}
        <div className="mt-4 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300 relative z-10">
          <span className="text-sm font-medium">View Details</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
