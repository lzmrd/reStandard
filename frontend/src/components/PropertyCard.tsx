"use client";

import { useState, useRef } from "react";
import { useProperty } from "@/hooks/useContracts";

interface PropertyCardProps {
  propertyId: bigint;
  onOpenVault?: (propertyId: bigint) => void;
}

export function PropertyCard({ propertyId, onOpenVault }: PropertyCardProps) {
  const { data: property, isLoading, refetch } = useProperty(propertyId);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
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

  const requestVerification = async () => {
    setVerifying(true);
    setVerifyError(null);

    try {
      const response = await fetch("/api/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: propertyId.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      await refetch();
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
        <div className="h-4 shimmer rounded w-1/2 mb-4"></div>
        <div className="h-4 shimmer rounded w-3/4 mb-3"></div>
        <div className="h-20 shimmer rounded"></div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="animated-border glow-card rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 inner-glow"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Property #{propertyId.toString()}
          </h3>
          <p className="text-sm text-white/50 mt-1">
            {property.comune}, {property.provincia}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
            property.verified
              ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse"
          }`}
        >
          {property.verified ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Verified
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Pending
            </>
          )}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm relative z-10">
        <div>
          <p className="text-white/50">Sheet</p>
          <p className="font-medium text-white">{property.foglio}</p>
        </div>
        <div>
          <p className="text-white/50">Parcel</p>
          <p className="font-medium text-white">{property.particella}</p>
        </div>
        <div>
          <p className="text-white/50">Sub-unit</p>
          <p className="font-medium text-white">{property.subalterno}</p>
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-white/50 text-sm">Category</p>
        <p className="font-medium text-white">{property.categoria}</p>
      </div>

      {!property.verified && (
        <div className="mt-4 relative z-10">
          <button
            onClick={requestVerification}
            disabled={verifying}
            className="btn-shine w-full rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2.5 text-sm font-medium text-white hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying TLS Proof...
              </span>
            ) : (
              "Request Verification"
            )}
          </button>
          {verifyError && (
            <p className="mt-2 text-sm text-red-400">{verifyError}</p>
          )}
        </div>
      )}

      {property.verified && onOpenVault && (
        <button
          onClick={() => onOpenVault(propertyId)}
          className="btn-shine mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 relative z-10"
        >
          Open Vault
        </button>
      )}
    </div>
  );
}
