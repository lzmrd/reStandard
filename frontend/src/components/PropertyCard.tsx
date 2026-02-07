"use client";

import { useState } from "react";
import { useProperty } from "@/hooks/useContracts";

interface PropertyCardProps {
  propertyId: bigint;
  onOpenVault?: (propertyId: bigint) => void;
}

export function PropertyCard({ propertyId, onOpenVault }: PropertyCardProps) {
  const { data: property, isLoading, refetch } = useProperty(propertyId);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

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
      
      // Refetch property data to update UI
      await refetch();
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Property #{propertyId.toString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {property.comune}, {property.provincia}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            property.verified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {property.verified ? "Verified" : "Pending"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Foglio</p>
          <p className="font-medium">{property.foglio}</p>
        </div>
        <div>
          <p className="text-gray-500">Particella</p>
          <p className="font-medium">{property.particella}</p>
        </div>
        <div>
          <p className="text-gray-500">Subalterno</p>
          <p className="font-medium">{property.subalterno}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-500 text-sm">Categoria</p>
        <p className="font-medium">{property.categoria}</p>
      </div>

      {/* Request Verification Button - solo se non verificata */}
      {!property.verified && (
        <div className="mt-4">
          <button
            onClick={requestVerification}
            disabled={verifying}
            className="w-full rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="mt-2 text-sm text-red-600">{verifyError}</p>
          )}
        </div>
      )}

      {/* Open Vault Button - solo se verificata */}
      {property.verified && onOpenVault && (
        <button
          onClick={() => onOpenVault(propertyId)}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open Vault
        </button>
      )}
    </div>
  );
}
