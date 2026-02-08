"use client";

import { useRef } from "react";
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

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: propertyIds } = useOwnerProperties(address);
  const { data: vaultIds } = useOwnerVaults(address);
  const { data: resdBalance } = useResdBalance(address);
  const { openVault } = useOpenVault();
  const balanceCardRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for balance card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!balanceCardRef.current) return;
    const rect = balanceCardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    balanceCardRef.current.style.setProperty("--mouse-x", `${x}%`);
    balanceCardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center animate-[fade-in-up_0.5s_ease-out_forwards]">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Connect your wallet to view your dashboard
            </h1>
            <p className="mt-2 text-white/50">
              Your properties and vaults will appear here
            </p>
          </div>
        </main>
      </div>
    );
  }

  const balance = resdBalance ? formatEther(resdBalance) : "0";

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Balance Card - Ultra Premium */}
        <div
          ref={balanceCardRef}
          onMouseMove={handleMouseMove}
          className="glow-card group rounded-2xl p-8 text-white mb-8 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden animate-[fade-in-down_0.5s_ease-out_forwards]"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-[gradient-shift_5s_ease_infinite] bg-[length:200%_200%]" />


          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Your RESD Balance
                </p>
                <p className="text-5xl font-bold mt-3 gradient-text-static">
                  {Number(balance).toLocaleString()} RESD
                </p>
                <p className="text-sm text-white/50 mt-2">
                  ≈ ${Number(balance).toLocaleString()} USD
                </p>
              </div>

              {/* Quick actions */}
              <div className="hidden sm:flex flex-col gap-2">
                <button className="btn-shine px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300">
                  Transfer
                </button>
                <button className="px-4 py-2 bg-white/[0.1] border border-white/[0.15] text-white/80 rounded-lg text-sm font-medium hover:bg-white/[0.15] transition-all duration-300">
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
              Your Properties
            </h2>
            <Link
              href="/register"
              className="btn-shine text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300"
            >
              + Register New
            </Link>
          </div>

          {propertyIds && propertyIds.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {propertyIds.map((id, index) => (
                <div
                  key={id.toString()}
                  className="opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PropertyCard
                    propertyId={id}
                    onOpenVault={(propertyId) => openVault(propertyId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-white/[0.15] p-8 text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.25] transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <p className="text-white/50">No properties registered yet.</p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Register your first property
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* Vaults Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            Your Vaults
          </h2>

          {vaultIds && vaultIds.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vaultIds.map((id, index) => (
                <div
                  key={id.toString()}
                  className="opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 100 + 200}ms` }}
                >
                  <VaultCard vaultId={id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-white/[0.15] p-8 text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.25] transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <p className="text-white/50">No vaults opened yet.</p>
              <p className="text-sm text-white/30 mt-1">
                Register and verify a property to open a vault.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
