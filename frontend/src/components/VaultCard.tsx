"use client";

import Link from "next/link";
import { useVault, useCollateralRatio, formatEther } from "@/hooks/useContracts";
import { HealthIndicator } from "./HealthIndicator";

interface VaultCardProps {
  vaultId: bigint;
}

const STATUS_LABELS = ["Active", "In Recall", "Closed"];

export function VaultCard({ vaultId }: VaultCardProps) {
  const { data: vault, isLoading: vaultLoading } = useVault(vaultId);
  const { data: ratio } = useCollateralRatio(vaultId);

  if (vaultLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!vault) return null;

  const debt = formatEther(vault.debt);
  const status = STATUS_LABELS[vault.status] || "Unknown";

  return (
    <Link href={`/vault/${vaultId.toString()}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-500 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vault #{vaultId.toString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Property #{vault.PropertyId.toString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              vault.status === 0
                ? "bg-green-100 text-green-800"
                : vault.status === 1
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-gray-500 text-sm">Debt</p>
          <p className="text-2xl font-bold text-gray-900">
            {Number(debt).toLocaleString()} RESD
          </p>
        </div>

        {ratio !== undefined && vault.status === 0 && (
          <div className="mt-4">
            <HealthIndicator ratio={Number(ratio)} />
          </div>
        )}
      </div>
    </Link>
  );
}
