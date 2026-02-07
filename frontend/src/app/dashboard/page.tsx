"use client";

import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { VaultCard } from "@/components/VaultCard";
import {
  useOwnerProperties,
  useOwnerVaults,
  useResdBalance,
  useOpenVault,
  formatEther,
} from "@/hooks/useContracts";
import Link from "next/link";
import { CircleGateway } from "@/components/CircleGateway";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: propertyIds } = useOwnerProperties(address);
  const { data: vaultIds } = useOwnerVaults(address);
  const { data: resdBalance } = useResdBalance(address);
  const { openVault, isPending: openingVault } = useOpenVault();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Connect your wallet to view your dashboard
            </h1>
          </div>
        </main>
      </div>
    );
  }

  const balance = resdBalance ? formatEther(resdBalance) : "0";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white mb-8">
          <p className="text-sm font-medium text-blue-100">Your RESD Balance</p>
          <p className="text-4xl font-bold mt-2">
            {Number(balance).toLocaleString()} RESD
          </p>
        </div>

        {/* Properties Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Properties</h2>
            <Link
              href="/register"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              + Register New
            </Link>
          </div>

          {propertyIds && propertyIds.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {propertyIds.map((id) => (
                <PropertyCard
                  key={id.toString()}
                  propertyId={id}
                  onOpenVault={(propertyId) => openVault(propertyId)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">No properties registered yet.</p>
              <Link
                href="/register"
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Register your first property
              </Link>
            </div>
          )}
        </section>

        {/* Vaults Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vaults</h2>

          {vaultIds && vaultIds.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vaultIds.map((id) => (
                <VaultCard key={id.toString()} vaultId={id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">No vaults opened yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Register and verify a property to open a vault.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
